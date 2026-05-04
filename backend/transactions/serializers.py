from rest_framework import serializers
from .models import Transaction
from wallets.models import Wallet


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id', 'wallet', 'user_id', 'type', 'amount',
            'gcash_reference', 'gcash_screenshot_url',
            'status', 'note', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'user_id', 'wallet', 'status',  # ← status is now always set server-side
            'created_at', 'updated_at',
        ]

    def create(self, validated_data):
        user_id = self.context['request'].user  # Supabase UID string

        # Get or create the user's wallet
        wallet, _ = Wallet.objects.get_or_create(user_id=user_id)

        validated_data['wallet'] = wallet
        validated_data['user_id'] = user_id
        validated_data['status'] = 'confirmed'  # ← always auto-confirm personal transactions

        transaction = Transaction.objects.create(**validated_data)

        # Update wallet balance immediately
        if transaction.type == 'deposit':
            wallet.balance += transaction.amount
        elif transaction.type == 'withdrawal':
            if wallet.balance < transaction.amount:
                transaction.delete()
                raise serializers.ValidationError("Insufficient balance.")
            wallet.balance -= transaction.amount

        wallet.save()
        return transaction