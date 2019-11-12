from rest_framework import serializers
from core.models import *


# class UserProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserProfile
#         fields = ('user', 'stripe_customer_id',
#                   'one_click_purchasing')


class ItemSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = ('id', 'name', 'price', 'discount_price', 'category',
                  'label', 'slug', 'description', 'image')

    def get_category(self, obj):
        return obj.get_category_display()

    def get_label(self, obj):
        return obj.get_label_display()

# class OrderItemSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = OrderItem
#         fields = ('user', 'item', 'quantity', 'ordered')


# class OrderSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Order
#         fields = ('user', 'ref_code', 'items', 'start_date', 'ordered_date', 'ordered', 'billing_address',
#                   'shipping_address', 'payment', 'coupon', 'being_delivered', 'received', 'refund_requested', 'refund_granted')


# class AddressSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Address
#         fields = ('user', 'street_address', 'apartment_address',
#                   'country', 'zip', 'address_type', 'default')


# class PaymentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Payment
#         fields = ('stripe_charge_id', 'user', 'amount', 'timestamp', 'default')


# class CouponSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Coupon
#         fields = ('code', 'amount')


# class RefundSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Refund
#         fields = ('order', 'reason', 'accepted', 'email')
