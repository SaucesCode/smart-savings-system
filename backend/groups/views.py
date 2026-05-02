# groups/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Group, GroupMember, GroupTransaction
from .serializers import GroupSerializer, GroupMemberSerializer, GroupTransactionSerializer


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return groups the user is an active member of
        return Group.objects.filter(
            members__user_id=self.request.user.id,
            members__is_active=True
        )

    def perform_create(self, serializer):
        # Save the group, then auto-add the creator as admin
        group = serializer.save(created_by=self.request.user.id)
        GroupMember.objects.create(
            group=group,
            user_id=self.request.user.id,
            role=GroupMember.Role.ADMIN
        )

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Allow a user to join a group."""
        group = self.get_object()
        member, created = GroupMember.objects.get_or_create(
            group=group,
            user_id=request.user.id,
            defaults={'role': GroupMember.Role.MEMBER}
        )
        if not created and member.is_active:
            raise ValidationError("You are already a member of this group.")
        member.is_active = True
        member.save()
        return Response(GroupMemberSerializer(member).data, status=status.HTTP_200_OK)


class GroupTransactionViewSet(viewsets.ModelViewSet):
    serializer_class = GroupTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_membership(self, group_id):
        """Helper: return the current user's membership or raise 403."""
        try:
            return GroupMember.objects.get(
                group_id=group_id,
                user_id=self.request.user.id,
                is_active=True
            )
        except GroupMember.DoesNotExist:
            raise PermissionDenied("You are not a member of this group.")

    def get_queryset(self):
        group_id = self.kwargs.get('group_pk')
        self._get_membership(group_id)  # Enforces membership check
        return GroupTransaction.objects.filter(group_id=group_id).order_by('-created_at')

    def perform_create(self, serializer):
        group_id = self.kwargs.get('group_pk')
        self._get_membership(group_id)
        group = Group.objects.get(pk=group_id)
        serializer.save(user_id=self.request.user.id, group=group)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        membership = self._get_membership(instance.group_id)

        # Only admins can change transaction status
        if 'status' in request.data and membership.role != GroupMember.Role.ADMIN:
            raise PermissionDenied("Only group admins can verify transactions.")

        return super().update(request, *args, **kwargs)