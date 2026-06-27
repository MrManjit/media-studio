from django.urls import path

from .views import (
    MediaListView,
    FavoriteListView,
    TrashListView,
    MediaUploadView,
    MediaFavoriteToggleView,
    MediaSaveView,
    MediaDetailView,
    MediaRestoreView,
    MediaPermanentDeleteView,
    AlbumListView,
    AlbumDetailView,
    AlbumBulkAddMediaView,
    AlbumRemoveMediaView,
)


urlpatterns = [

    # =========================
    # Media Library
    # =========================

    # Active Library
    path(
        "",
        MediaListView.as_view(),
        name="media-list",
    ),

    # Upload Media
    path(
        "upload/",
        MediaUploadView.as_view(),
        name="media-upload",
    ),

    # Favorites
    path(
        "favorites/",
        FavoriteListView.as_view(),
        name="media-favorites",
    ),

    # Toggle Favorite
    path(
        "<uuid:pk>/favorite/",
        MediaFavoriteToggleView.as_view(),
        name="media-favorite-toggle",
    ),


    # =========================
    # Albums
    # =========================

    # List albums / Create album
    path(
        "albums/",
        AlbumListView.as_view(),
        name="album-list",
    ),

    # Album details / Update / Delete
    path(
        "albums/<uuid:pk>/",
        AlbumDetailView.as_view(),
        name="album-detail",
    ),

    # # Add media to album
    # path(
    #     "albums/<uuid:pk>/add-media/",
    #     AlbumAddMediaView.as_view(),
    #     name="album-add-media",
    # ),
    # Add multiple media to album
    path(
        "albums/<uuid:pk>/bulk-add/",
        AlbumBulkAddMediaView.as_view(),
        name="album-bulk-add",
    ),

    # Remove media from album
    path(
        "albums/<uuid:pk>/remove-media/<uuid:media_id>/",
        AlbumRemoveMediaView.as_view(),
        name="album-remove-media",
    ),


    # =========================
    # Trash Management
    # =========================

    # Trash list
    path(
        "trash/",
        TrashListView.as_view(),
        name="media-trash",
    ),

    # Save edited media
    path(
        "<uuid:pk>/save/",
        MediaSaveView.as_view(),
        name="media-save",
    ),

    # Move to Trash
    path(
        "<uuid:pk>/",
        MediaDetailView.as_view(),
        name="media-detail",
    ),

    # Restore from Trash
    path(
        "<uuid:pk>/restore/",
        MediaRestoreView.as_view(),
        name="media-restore",
    ),

    # Permanently Delete
    path(
        "<uuid:pk>/permanent/",
        MediaPermanentDeleteView.as_view(),
        name="media-delete-permanent",
    ),
]