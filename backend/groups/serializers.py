from rest_framework import serializers
from .models import Group, GroupMember, GroupTransaction
import uuid


class GroupMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMember
        fields = ['id', 'group', 'user_id', 'name', 'role', 'joined_at']
        read_only_fields = ['id', 'user_id', 'joined_at']


class GroupSerializer(serializers.ModelSerializer):
    members = GroupMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'description', 'savings_goal',
            'total_saved', 'created_by', 'invite_code',
            'gcash_number', 'gcash_name', 'gcash_qr_url',
            'created_at', 'updated_at', 'members', 'member_count'
        ]
        read_only_fields = ['id', 'created_by', 'invite_code', 'total_saved', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['invite_code'] = uuid.uuid4().hex[:8]
        return super().create(validated_data)

    def get_member_count(self, obj):
        return obj.members.count()


class GroupTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupTransaction
        fields = [
            'id', 'group', 'user_id', 'amount', 'status',
            'gcash_reference', 'gcash_screenshot_url', 'note',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'group', 'user_id', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        new_status = validated_data.get('status', instance.status)
        previously_confirmed = instance.status == 'confirmed'

        instance = super().update(instance, validated_data)

        # Only update group balance the first time it's confirmed
        if new_status == 'confirmed' and not previously_confirmed:
            group = instance.group
            group.total_saved += instance.amount
            group.save()

        return instance