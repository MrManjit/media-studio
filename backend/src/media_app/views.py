from django.utils import timezone
from django.shortcuts import get_object_or_404

from django.core.files.uploadedfile import UploadedFile

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Media, Album
from .serializers import (
    MediaSerializer,
    MediaUploadSerializer,
    AlbumSerializer,
    AlbumDetailSerializer,
)


class MediaListView(generics.ListAPIView):
    """
    Active media library
    """

    serializer_class = MediaSerializer

    def get_queryset(self):
        return (
            Media.objects
            .filter(is_deleted=False)
            .order_by("-created_at")
        )


class FavoriteListView(generics.ListAPIView):
    """
    Favorite media
    """

    serializer_class = MediaSerializer

    def get_queryset(self):
        return (
            Media.objects
            .filter(
                is_deleted=False,
                is_favorite=True
            )
            .order_by("-created_at")
        )


class TrashListView(generics.ListAPIView):
    """
    Deleted media
    """

    serializer_class = MediaSerializer

    def get_queryset(self):
        return (
            Media.objects
            .filter(is_deleted=True)
            .order_by("-deleted_at")
        )


class MediaUploadView(generics.CreateAPIView):
    """
    Upload new media
    """

    serializer_class = MediaUploadSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        media = serializer.save()
        output_serializer = MediaSerializer(media, context={"request": request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class MediaFavoriteToggleView(APIView):
    """
    Add or remove favorite
    """

    def post(self, request, pk):

        media = get_object_or_404(
            Media,
            pk=pk,
            is_deleted=False,
        )

        media.is_favorite = not media.is_favorite

        media.save()

        return Response(
            {
                "message": (
                    "Added to favorites"
                    if media.is_favorite
                    else "Removed from favorites"
                ),
                "is_favorite": media.is_favorite,
            },
            status=status.HTTP_200_OK,
        )


class MediaSaveView(APIView):
    """
    Save edited media by replacing the stored file.
    """

    def post(self, request, pk):
        media = get_object_or_404(Media, pk=pk)
        uploaded_file = request.FILES.get("file")

        if not isinstance(uploaded_file, UploadedFile):
            return Response(
                {"detail": "No edited file was provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if media.file:
            media.file.delete(save=False)

        media.file = uploaded_file
        media.original_filename = uploaded_file.name.rsplit("/", 1)[-1]
        media.mime_type = uploaded_file.content_type or "application/octet-stream"
        media.file_size = uploaded_file.size
        media.media_type = (
            "image"
            if media.mime_type.startswith("image/")
            else media.media_type
        )
        media.save()

        serializer = MediaSerializer(media, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class MediaDetailView(APIView):
    """
    Retrieve a single media item or move it to trash.
    """

    def get(self, request, pk):
        media = get_object_or_404(Media, pk=pk)
        serializer = MediaSerializer(media, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        media = get_object_or_404(
            Media,
            pk=pk,
            is_deleted=False,
        )

        media.is_deleted = True
        media.deleted_at = timezone.now()

        media.save()

        return Response(
            {
                "message": "Moved to trash",
            },
            status=status.HTTP_200_OK,
        )


class MediaRestoreView(APIView):
    """
    Restore from trash
    """

    def post(self, request, pk):

        media = get_object_or_404(
            Media,
            pk=pk,
            is_deleted=True,
        )

        media.is_deleted = False
        media.deleted_at = None

        media.save()

        return Response(
            {
                "message": "Media restored",
            },
            status=status.HTTP_200_OK,
        )


class MediaPermanentDeleteView(APIView):
    """
    Delete forever
    """

    def delete(self, request, pk):

        media = get_object_or_404(
            Media,
            pk=pk,
            is_deleted=True,
        )

        # remove original file
        if media.file:
            media.file.delete(save=False)

        # remove thumbnail
        if media.thumbnail:
            media.thumbnail.delete(save=False)

        media.delete()

        return Response(
            {
                "message": "Media permanently deleted",
            },
            status=status.HTTP_200_OK,
        )
    
class AlbumListView(APIView):
    """
    List all albums and create a new album
    """

    def get(self, request):

        albums = (
            Album.objects
            .all()
            .order_by("-created_at")
        )

        serializer = AlbumSerializer(
            albums,
            many=True,
            context={"request": request},
        )

        return Response(serializer.data)


    def post(self, request):

        serializer = AlbumSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class AlbumDetailView(APIView):
    """
    Retrieve, update or delete a single album
    """

    def get_object(self, pk):

        return get_object_or_404(
            Album,
            pk=pk,
        )


    def get(self, request, pk):

        album = self.get_object(pk)

        serializer = AlbumDetailSerializer(
            album,
            context={"request": request},
        )

        return Response(serializer.data)


    def put(self, request, pk):

        album = self.get_object(pk)

        serializer = AlbumSerializer(
            album,
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


    def delete(self, request, pk):

        album = self.get_object(pk)

        album.media.clear()

        album.delete()

        return Response(
            {
                "message": "Album deleted successfully"
            },
            status=status.HTTP_200_OK,
        )


# class AlbumAddMediaView(APIView):
#     """
#     Add media file to album
#     """

#     def post(self, request, pk):

#         album = get_object_or_404(
#             Album,
#             pk=pk,
#         )

#         media_id = request.data.get(
#             "media_id"
#         )

#         media = get_object_or_404(
#             Media,
#             pk=media_id,
#             is_deleted=False,
#         )

#         if album.media.filter(
#             pk=media.pk
#         ).exists():

#             return Response(
#                 {
#                     "message":
#                     "Media already exists in album"
#                 },
#                 status=status.HTTP_200_OK,
#             )

#         album.media.add(media)

#         return Response(
#             {
#                 "message":
#                 "Media added to album"
#             },
#             status=status.HTTP_200_OK,
#         )

class AlbumBulkAddMediaView(APIView):
    """
    Add multiple media items to an album
    """

    def post(self, request, pk):

        album = get_object_or_404(
            Album,
            pk=pk,
        )

        media_ids = request.data.get(
            "media_ids",
            []
        )

        if not media_ids:

            return Response(
                {
                    "message": "No media selected."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        added = 0

        for media in Media.objects.filter(
            id__in=media_ids,
            is_deleted=False,
        ):

            if not album.media.filter(
                pk=media.pk
            ).exists():

                album.media.add(media)
                added += 1

        return Response(
            {
                "message": f"{added} media added.",
                "added": added,
            },
            status=status.HTTP_200_OK,
        )

class AlbumRemoveMediaView(APIView):
    """
    Remove media file from album
    """

    def delete(
        self,
        request,
        pk,
        media_id,
    ):

        album = get_object_or_404(
            Album,
            pk=pk,
        )

        media = get_object_or_404(
            Media,
            pk=media_id,
        )

        album.media.remove(media)

        return Response(
            {
                "message":
                "Media removed from album"
            },
            status=status.HTTP_200_OK,
        )
