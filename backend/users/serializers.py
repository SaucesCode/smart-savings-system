from rest_framework import serializers


class ProfileGCashSerializer(serializers.Serializer):
    gcash_number = serializers.CharField(max_length=20, allow_blank=True)
    gcash_name = serializers.CharField(max_length=100, allow_blank=True)
    gcash_qr_url = serializers.URLField(allow_blank=True, required=False)