from rest_framework import serializers
from .models import Transaction
from wallets.models import Wallet

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id', 'user_id', 'wallet', 'transaction_type',
            'amount', 'status', 'reference_number',
            'screenshot_url', 'note', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at', 'wallet']

    def update(self, instance, validated_data):
        new_status = validated_data.get('status', instance.status)
        previously_confirmed = instance.status == Transaction.Status.CONFIRMED

        instance = super().update(instance, validated_data)

        # Only update balance when status first becomes confirmed
        if new_status == Transaction.Status.CONFIRMED and not previously_confirmed:
            wallet = instance.wallet
            if instance.transaction_type == Transaction.TransactionType.DEPOSIT:
                wallet.balance += instance.amount
            elif instance.transaction_type == Transaction.TransactionType.WITHDRAWAL:
                wallet.balance -= instance.amount
            elif instance.transaction_type == Transaction.TransactionType.CONTRIBUTION:
                wallet.balance -= instance.amount
            wallet.save()

        return instance