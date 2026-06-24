# from django.urls import path

# from .views import (
#     MediaListView,
#     TrashListView,
#     MediaUploadView,
#     MediaDeleteView,
#     MediaRestoreView,
#     MediaPermanentDeleteView,
# )


# urlpatterns = [

#     # Library
#     path(
#         "",
#         MediaListView.as_view(),
#         name="media-list",
#     ),

#     # Upload
#     path(
#         "upload/",
#         MediaUploadView.as_view(),
#         name="media-upload",
#     ),

#     # Trash
#     path(
#         "trash/",
#         TrashListView.as_view(),
#         name="media-trash",
#     ),

#     # Move to Trash
#     path(
#         "<uuid:pk>/",
#         MediaDeleteView.as_view(),
#         name="media-delete",
#     ),

#     # Restore
#     path(
#         "<uuid:pk>/restore/",
#         MediaRestoreView.as_view(),
#         name="media-restore",
#     ),

#     # Permanent Delete
#     path(
#         "<uuid:pk>/permanent/",
#         MediaPermanentDeleteView.as_view(),
#         name="media-permanent-delete",
#     ),
# ]

from django.urls import path

from .views import (
    MediaListView,
    FavoriteListView,
    TrashListView,
    MediaUploadView,
    MediaFavoriteToggleView,
    MediaDeleteView,
    MediaRestoreView,
    MediaPermanentDeleteView,
)


urlpatterns = [

    # Active Library
    path(
        "",
        MediaListView.as_view(),
        name="media-list",
    ),


    # Upload
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


    # Trash List
    path(
        "trash/",
        TrashListView.as_view(),
        name="media-trash",
    ),


    # Move to Trash
    path(
        "<uuid:pk>/",
        MediaDeleteView.as_view(),
        name="media-trash-move",
    ),


    # Restore from Trash
    path(
        "<uuid:pk>/restore/",
        MediaRestoreView.as_view(),
        name="media-restore",
    ),


    # Permanent Delete
    path(
        "<uuid:pk>/permanent/",
        MediaPermanentDeleteView.as_view(),
        name="media-delete-permanent",
    ),
]