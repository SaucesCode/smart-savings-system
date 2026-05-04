from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/", include("wallets.urls")),
    path("api/", include("groups.urls")),
    path("api/", include("transactions.urls")),
    path('api/users/', include('users.urls')),
]