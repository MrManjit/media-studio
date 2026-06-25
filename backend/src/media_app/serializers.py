from rest_framework import serializers

from .models import Media, Album


class MediaSerializer(serializers.ModelSerializer):
    """
    Serializer for media library
    """

    file_url = serializers.SerializerMethodField()


    class Meta:
        model = Media

        fields = [
            "id",
            "original_filename",
            "media_type",
            "mime_type",
            "file_size",
            "width",
            "height",
            "duration",
            "file_url",
            "created_at",
            "updated_at",
            "is_favorite",
            "is_deleted",
            "deleted_at",
        ]


    def get_file_url(self, obj):
        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.file.url
            )

        return obj.file.url


class MediaUploadSerializer(serializers.ModelSerializer):
    """
    Serializer for uploading media
    """

    class Meta:
        model = Media

        fields = [
            "file",
        ]


    def create(self, validated_data):

        uploaded_file = validated_data["file"]

        media_type = "image"

        if uploaded_file.content_type.startswith("video"):
            media_type = "video"


        return Media.objects.create(
            file=uploaded_file,
            original_filename=uploaded_file.name,
            media_type=media_type,
            mime_type=uploaded_file.content_type,
            file_size=uploaded_file.size,
        )


class AlbumSerializer(serializers.ModelSerializer):
    """
    Serializer for media albums
    """

    media_count = serializers.SerializerMethodField()

    cover_image_url = serializers.SerializerMethodField()


    class Meta:
        model = Album

        fields = [
            "id",
            "name",
            "description",
            "media_count",
            "cover_image",
            "cover_image_url",
            "created_at",
            "updated_at",
        ]


    def get_media_count(self, obj):
        return obj.media.count()


    def get_cover_image_url(self, obj):

        if obj.cover_image:

            request = self.context.get("request")

            if request:
                return request.build_absolute_uri(
                    obj.cover_image.file.url
                )

            return obj.cover_image.file.url

        return None
    
class AlbumDetailSerializer(serializers.ModelSerializer):
    """
    Album with media contents
    """

    media = MediaSerializer(
        many=True,
        read_only=True,
    )

    media_count = serializers.SerializerMethodField()

    cover_image_url = serializers.SerializerMethodField()


    class Meta:
        model = Album

        fields = [
            "id",
            "name",
            "description",
            "media_count",
            "cover_image",
            "cover_image_url",
            "media",
            "created_at",
            "updated_at",
        ]


    def get_media_count(self, obj):
        return obj.media.count()


    def get_cover_image_url(self, obj):

        if obj.cover_image:

            request = self.context.get("request")

            if request:
                return request.build_absolute_uri(
                    obj.cover_image.file.url
                )

            return obj.cover_image.file.url

        return None