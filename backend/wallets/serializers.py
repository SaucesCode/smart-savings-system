from rest_framework import serializers
from .models import Wallet

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'user_id', 'balance', 'savings_goal', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_id', 'balance', 'created_at', 'updated_at']