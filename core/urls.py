from django.urls import path
from .views import *

app_name = 'core'
#
urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('checkout', CheckoutView.as_view(), name='checkout'),
    path('order-summary', OrderSummaryView.as_view(), name='order-summary'),
    path('product/<slug>', ItemDetailView.as_view(), name='product'),

    path('add-to-cart/<slug>', add_to_cart, name='add-to-cart'),
    path('add-coupon/', AddCouponView.as_view(), name='add-coupon'),
    path('add-item/<slug>', add_in_cart, name='add-in-cart'),

    path('remove-from-cart/<slug>', remove_from_cart, name='remove-from-cart'),
    path('remove-item/<slug>',
         remove_single_item, name='remove-single-item'),
    path('remove-items/<slug>', remove_items, name='remove-items'),
    path('payment/<payment_option>/', PaymentView.as_view(), name='payment'),
    path('request-refund', RequestRefundView.as_view(), name='request-refund'),
]
