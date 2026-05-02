from django.db import models
import uuid

class Wallet(models.Model):
    user_id = models.UUIDField(unique=True)  # Supabase Auth UUID
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    savings_goal = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet({self.user_id})"