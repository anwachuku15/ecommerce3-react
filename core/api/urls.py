from django.urls import path
from .views import *

urlpatterns = [
    path('product-list/', ItemListView.as_view(), name='product-list'),
    # No item slug parameters because they are included in request.data
    path('add-to-cart/', AddToCartView.as_view(), name='add-to-cart'),
]
