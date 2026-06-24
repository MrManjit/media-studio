from rest_framework import serializers

from .models import Media


class MediaSerializer(serializers.ModelSerializer):

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
            return request.build_absolute_uri(obj.file.url)

        return obj.file.url
    
class MediaUploadSerializer(serializers.ModelSerializer):

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