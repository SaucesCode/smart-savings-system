import jwt
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class SupabaseAuthentication(BaseAuthentication):
    """
    Validates Supabase JWT tokens sent as Bearer tokens.
    Automatically creates/fetches a Django User from the Supabase user ID.
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1]

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f"Invalid token: {e}")

        supabase_uid = payload.get("sub")
        email = payload.get("email", "")

        if not supabase_uid:
            raise AuthenticationFailed("Token missing subject (sub) claim.")

        user, _ = User.objects.get_or_create(
            username=supabase_uid,
            defaults={"email": email},
        )

        return (user, payload)

    def authenticate_header(self, request):
        return "Bearer"