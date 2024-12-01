from django.contrib import admin
from .models import Link

@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    # 모든 필드를 list_display에 추가
    list_display = ('id', 'user_uuid', 'title', 'url', 'description', 'keywords', 'image_url', 'created_at', 'updated_at')

    # 검색 필드를 추가하여 title과 description을 검색할 수 있게 설정
    search_fields = ('title', 'description', 'url', 'keywords')

    # list_filter를 추가하여 날짜, 사용자 UUID 등으로 필터링할 수 있게 설정
    list_filter = ('created_at', 'updated_at', 'user_uuid')

    # 필드가 너무 길어지는 경우 줄바꿈 적용 (옵션)
    list_display_links = ('id', 'title')  # 링크로 사용할 필드 설정

    # list_per_page를 추가하여 한 페이지에 표시되는 객체 수를 설정
    list_per_page = 20
