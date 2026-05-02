from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from supabase import create_client
from django.conf import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1]

        try:
            response = supabase.auth.get_user(token)
            supabase_user = response.user
            if not supabase_user:
                raise AuthenticationFailed("Invalid token.")
        except Exception as e:
            raise AuthenticationFailed(f"Invalid token: {e}")

        user, _ = User.objects.get_or_create(
            username=supabase_user.id,
            defaults={"email": supabase_user.email or ""}
        )

        return (user, token)

    def authenticate_header(self, request):
        return "Bearer"