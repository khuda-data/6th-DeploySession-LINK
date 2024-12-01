from django.db import models
from django.utils import timezone
import uuid

class Link(models.Model):
    url = models.URLField()
    title = models.CharField(max_length=255, default="No Title")
    description = models.TextField(blank=True, null=True)
    keywords = models.JSONField(default=list)
    #image_url = models.URLField(blank=True, null=True)
    image_url = models.CharField(max_length=2048, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    user_uuid = models.CharField(max_length=36, default=uuid.uuid4)
    category = models.CharField(max_length=255, default="ALL")  # 기본값 "ALL" 추가

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user_uuid', 'url'], name='unique_user_link')
        ]
        
    def __str__(self):
        return self.title