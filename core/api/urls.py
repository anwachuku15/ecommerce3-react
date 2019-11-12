from django.urls import path
from .views import *

urlpatterns = [
    path('product-list', ItemListView.as_view(), name='product-list'),
]
