# from django.utils import timezone

# from rest_framework import generics, status
# from rest_framework.response import Response
# from rest_framework.views import APIView

# from .models import Media
# from .serializers import (
#     MediaSerializer,
#     MediaUploadSerializer,
# )


# class MediaListView(generics.ListAPIView):
#     """
#     Show only active media
#     """

#     serializer_class = MediaSerializer

#     def get_queryset(self):
#         return Media.objects.filter(
#             is_deleted=False
#         ).order_by("-created_at")


# class TrashListView(generics.ListAPIView):
#     """
#     Show deleted media
#     """

#     serializer_class = MediaSerializer

#     def get_queryset(self):
#         return Media.objects.filter(
#             is_deleted=True
#         ).order_by("-deleted_at")


# class MediaUploadView(generics.CreateAPIView):
#     """
#     Upload media
#     """

#     serializer_class = MediaUploadSerializer


# class MediaDeleteView(APIView):
#     """
#     Move media to trash
#     """

#     def delete(self, request, pk):

#         media = Media.objects.get(
#             pk=pk
#         )

#         media.is_deleted = True
#         media.deleted_at = timezone.now()

#         media.save()

#         return Response(
#             {
#                 "message": "Moved to trash"
#             },
#             status=status.HTTP_200_OK,
#         )


# class MediaRestoreView(APIView):
#     """
#     Restore from trash
#     """

#     def post(self, request, pk):

#         media = Media.objects.get(
#             pk=pk
#         )

#         media.is_deleted = False
#         media.deleted_at = None

#         media.save()

#         return Response(
#             {
#                 "message": "Restored successfully"
#             },
#             status=status.HTTP_200_OK,
#         )


# class MediaPermanentDeleteView(APIView):
#     """
#     Remove forever
#     """

#     def delete(self, request, pk):

#         media = Media.objects.get(
#             pk=pk
#         )

#         if media.file:
#             media.file.delete(
#                 save=False
#             )

#         if media.thumbnail:
#             media.thumbnail.delete(
#                 save=False
#             )

#         media.delete()

#         return Response(
#             {
#                 "message": "Deleted permanently"
#             },
#             status=status.HTTP_200_OK,
#         )

from django.utils import timezone
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Media
from .serializers import (
    MediaSerializer,
    MediaUploadSerializer,
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


class MediaDeleteView(APIView):
    """
    Move media to trash
    """

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