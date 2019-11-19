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


class ItemVariationSerializer(serializers.ModelSerializer):
    # variation = serializers.SerializerMethodField()
    class Meta:
        model = ItemVariation
        fields = ('id', 'value', 'attachment')


class VariationSerializer(serializers.ModelSerializer):
    item_variations = serializers.SerializerMethodField()

    class Meta:
        model = Variation
        fields = ('id', 'name', 'item_variations')

    def get_item_variations(self, obj):
        return ItemVariationSerializer(obj.itemvariation_set.all(), many=True).data


class ItemDetailSerializer(serializers.ModelSerializer):
    # SerializerMethodField because category & label are choices...
    # ... so we want the value and display name for the get_category & get_label methods
    category = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()
    # must serialize variations (above), otherwise, the pk for each variation will be displayed
    variations = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = ('id', 'name', 'price', 'discount_price', 'category',
                  'label', 'slug', 'description', 'image', 'variations')

    def get_category(self, obj):
        return obj.get_category_display()

    def get_label(self, obj):
        return obj.get_label_display()

    def get_variations(self, obj):
        return VariationSerializer(obj.variation_set.all(), many=True).data


class OrderItemSerializer(serializers.ModelSerializer):
    # item must reference ItemSerializer
    item = StringSerializer()
    item_obj = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ('id', 'item', 'item_obj', 'quantity', 'final_price')

    def get_item_obj(self, obj):
        return ItemSerializer(obj.item).data

    def get_final_price(self, obj):
        return obj.get_final_price()


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ('id', 'code', 'amount')


class OrderSerializer(serializers.ModelSerializer):
    # Ultimately we want to display all order items and the number of items
    order_items = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    coupon = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ('id', 'order_items', 'total', 'coupon')

    def get_order_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many=True).data

    def get_total(self, obj):
        return obj.get_total()

    def get_coupon(self, obj):
        if obj.coupon is not None:
            return CouponSerializer(obj.coupon).data
        return None


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
