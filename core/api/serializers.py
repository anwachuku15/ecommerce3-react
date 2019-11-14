from rest_framework import serializers
from core.models import *


# class UserProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserProfile
#         fields = ('user', 'stripe_customer_id',
#                   'one_click_purchasing')

class StringSerializer(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value


class ItemSerializer(serializers.ModelSerializer):
    # SerializerMethodField because category & label are choices...
    # ... so we want the value and display name for the get_category & get_label methods
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


class OrderItemSerializer(serializers.ModelSerializer):
    # item must reference ItemSerializer
    item = StringSerializer()

    class Meta:
        model = OrderItem
        fields = ('id', 'item', 'quantity')


class OrderSerializer(serializers.ModelSerializer):
    # Ultimately we want to display all order items and the number of items
    order_items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ('id', 'order_items')

    def get_order_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many=True).data


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
