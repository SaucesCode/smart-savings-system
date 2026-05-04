from django.db import models
import uuid


def generate_invite_code():
    while True:
        code = uuid.uuid4().hex[:8]
        if not Group.objects.filter(invite_code=code).exists():
            return code

class Group(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by = models.CharField(max_length=255)  # Supabase user ID
    invite_code = models.CharField(
        max_length=20,
        unique=True,
        default=generate_invite_code
    )
    savings_goal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_saved = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # GCash payment details for this group
    gcash_number = models.CharField(max_length=20, blank=True, default='')
    gcash_name = models.CharField(max_length=100, blank=True, default='')
    gcash_qr_url = models.URLField(blank=True, default='')  # link to uploaded QR image

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    ROLE_CHOICES = [('admin', 'Admin'), ('member', 'Member')]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members')
    user_id = models.CharField(max_length=255)  # Supabase user ID
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('group', 'user_id')

    def __str__(self):
        return f"{self.user_id} in {self.group.name} ({self.role})"


class GroupTransaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='transactions')
    user_id = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    gcash_reference = models.CharField(max_length=100, blank=True)
    gcash_screenshot_url = models.URLField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user_id} → {self.group.name} ₱{self.amount} ({self.status})"