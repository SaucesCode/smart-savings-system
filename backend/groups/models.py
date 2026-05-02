# groups/models.py
from django.db import models


class Group(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    target_date = models.DateField(null=True, blank=True)
    created_by = models.UUIDField()  # Supabase user ID of the creator
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        MEMBER = 'member', 'Member'

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members')
    user_id = models.UUIDField()
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('group', 'user_id')  # One membership per user per group

    def __str__(self):
        return f"{self.user_id} in {self.group.name} ({self.role})"


class GroupTransaction(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        REJECTED = 'rejected', 'Rejected'

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='transactions')
    user_id = models.UUIDField()  # Who made the contribution
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reference_number = models.CharField(max_length=100, blank=True)
    screenshot_url = models.URLField(blank=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user_id} → {self.group.name}: {self.amount} ({self.status})"