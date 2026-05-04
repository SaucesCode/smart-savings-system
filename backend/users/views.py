import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ProfileGCashSerializer


SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')


def get_supabase_headers():
    return {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type': 'application/json',
    }


class ProfileView(APIView):

    def get(self, request):
        user_id = str(request.user)  # Supabase UID from JWT

        res = requests.get(
            f'{SUPABASE_URL}/rest/v1/profiles',
            headers=get_supabase_headers(),
            params={'id': f'eq.{user_id}', 'select': '*'},
        )

        if res.status_code != 200 or not res.json():
            return Response({'detail': 'Profile not found.'}, status=404)

        return Response(res.json()[0])

    def patch(self, request):
        user_id = str(request.user)

        serializer = ProfileGCashSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        res = requests.patch(
            f'{SUPABASE_URL}/rest/v1/profiles',
            headers={**get_supabase_headers(), 'Prefer': 'return=representation'},
            params={'id': f'eq.{user_id}'},
            json=serializer.validated_data,
        )

        if res.status_code not in (200, 204):
            return Response({'detail': 'Failed to update profile.'}, status=500)

        return Response(res.json()[0] if res.json() else serializer.validated_data)