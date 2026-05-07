# groups/urls.py
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from .views import GroupViewSet, GroupTransactionViewSet, GroupTransactionAdminViewSet

router = DefaultRouter()
router.register(r'groups', GroupViewSet, basename='group')

# Nested: /api/groups/{group_pk}/transactions/
groups_router = nested_routers.NestedDefaultRouter(router, r'groups', lookup='group')
groups_router.register(r'transactions', GroupTransactionViewSet, basename='group-transactions')
router.register(r'group-transactions-admin', GroupTransactionAdminViewSet, basename='group-transactions-admin')

urlpatterns = router.urls + groups_router.urls