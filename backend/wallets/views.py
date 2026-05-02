from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Wallet
from .serializers import WalletSerializer

class WalletViewSet(viewsets.ModelViewSet):
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only ever see their own wallet
        return Wallet.objects.filter(user_id=self.request.user.id)

    def perform_create(self, serializer):
        # Automatically assign wallet to the authenticated user
        serializer.save(user_id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        # GET /api/wallets/me/ — get or create wallet for current user
        wallet, created = Wallet.objects.get_or_create(user_id=request.user.id)
        serializer = self.get_serializer(wallet)
        return Response(serializer.data)