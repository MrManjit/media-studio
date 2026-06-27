from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse

from .models import Media


class MediaSaveViewTests(TestCase):
    def setUp(self):
        self.media = Media.objects.create(
            file=SimpleUploadedFile("original.jpg", b"fake-image", content_type="image/jpeg"),
            original_filename="original.jpg",
            media_type="image",
            mime_type="image/jpeg",
            file_size=11,
            width=10,
            height=10,
        )

    def test_save_replaces_media_file(self):
        edited_file = SimpleUploadedFile("edited.png", b"edited-image", content_type="image/png")

        response = self.client.post(
            reverse("media-save", kwargs={"pk": self.media.pk}),
            {"file": edited_file},
            format="multipart",
        )

        self.assertEqual(response.status_code, 200)
        self.media.refresh_from_db()
        self.assertTrue(self.media.file.name.endswith("edited.png"))
        self.assertEqual(self.media.original_filename, "edited.png")
        self.assertEqual(self.media.mime_type, "image/png")
