# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import LinkViewSet

# router = DefaultRouter()
# router.register(r'links', LinkViewSet)

# urlpatterns = [
#     path('', include(router.urls)),  
#     path('extract_from_url/', LinkViewSet.as_view({'post': 'extract_from_url'})),
#     path('add/', LinkViewSet.as_view({'post': 'add_link'})),
#     path('links/<int:pk>/delete/', LinkViewSet.as_view({'delete': 'delete_link'})),
# ]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LinkViewSet

router = DefaultRouter()
router.register(r'links', LinkViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('extract_from_url/', LinkViewSet.as_view({'post': 'extract_from_url'})),
]
