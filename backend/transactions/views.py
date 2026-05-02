from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Transaction
from .serializers import TransactionSerializer
from wallets.models import Wallet

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users only see their own transactions
        return Transaction.objects.filter(
            user_id=self.request.user.id
        ).order_by('-created_at')

    def perform_create(self, serializer):
        # Auto-assign user and their wallet
        wallet, _ = Wallet.objects.get_or_create(user_id=self.request.user.id)
        serializer.save(user_id=self.request.user.id, wallet=wallet)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Only the owner can update their own transaction
        if str(instance.user_id) != str(request.user.id):
            raise PermissionDenied
        return super().update(request, *args, **kwargs)