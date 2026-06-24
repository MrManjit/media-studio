# from django.contrib import admin
# from django.urls import path, include


# urlpatterns = [
#     path(
#         "admin/",
#         admin.site.urls
#     ),

#     path(
#         "api/",
#         include("core.urls")
#     ),
# ]

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from core.views import health_check


urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "api/health/",
        health_check,
        name="health-check",
    ),

    path(
        "api/media/",
        include("media_app.urls"),
    ),
]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT,
)