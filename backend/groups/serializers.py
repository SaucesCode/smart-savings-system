# groups/serializers.py
from rest_framework import serializers
from .models import Group, GroupMember, GroupTransaction


class GroupMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMember
        fields = ['id', 'group', 'user_id', 'role', 'joined_at', 'is_active']
        read_only_fields = ['id', 'user_id', 'joined_at']


class GroupSerializer(serializers.ModelSerializer):
    members = GroupMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'description', 'goal_amount',
            'current_balance', 'target_date', 'created_by',
            'created_at', 'updated_at', 'members', 'member_count'
        ]
        read_only_fields = ['id', 'created_by', 'current_balance', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()


class GroupTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupTransaction
        fields = [
            'id', 'group', 'user_id', 'amount', 'status',
            'reference_number', 'screenshot_url', 'note',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        new_status = validated_data.get('status', instance.status)
        previously_confirmed = instance.status == GroupTransaction.Status.CONFIRMED

        instance = super().update(instance, validated_data)

        # Only update group balance the first time it's confirmed
        if new_status == GroupTransaction.Status.CONFIRMED and not previously_confirmed:
            group = instance.group
            group.current_balance += instance.amount
            group.save()

        return instance