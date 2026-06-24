import uuid

from django.db import models


class Media(models.Model):
    """
    Main media object for images and videos
    """

    class MediaType(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    file = models.FileField(
        upload_to="uploads/%Y/%m/%d/",
    )

    original_filename = models.CharField(
        max_length=255,
    )

    media_type = models.CharField(
        max_length=20,
        choices=MediaType.choices,
    )

    mime_type = models.CharField(
        max_length=100,
    )

    file_size = models.BigIntegerField(
        help_text="Size in bytes",
    )

    width = models.IntegerField(
        null=True,
        blank=True,
    )

    height = models.IntegerField(
        null=True,
        blank=True,
    )

    duration = models.FloatField(
        null=True,
        blank=True,
        help_text="Video duration in seconds",
    )

    thumbnail = models.ImageField(
        upload_to="thumbnails/%Y/%m/%d/",
        null=True,
        blank=True,
    )


    # =========================
    # Media Management Features
    # =========================

    is_favorite = models.BooleanField(
        default=False,
        help_text="Marked as favorite by user",
    )

    is_deleted = models.BooleanField(
        default=False,
        help_text="Moved to trash",
    )

    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When media was moved to trash",
    )


    # =========================
    # Timestamps
    # =========================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )


    def __str__(self):
        return self.original_filename