from django.contrib import admin
from django.conf import settings
# Register your models here.
from .models import *


def accept_refund(modeladmin, request, queryset):
    queryset.update(refund_requested=False, refund_granted=True)


accept_refund.short_description = 'Accept refund requests'


def order_en_route(modeladmin, request, queryset):
    queryset.update(being_delivered=True)


order_en_route.short_description = 'Being delivered'


class OrderAdmin(admin.ModelAdmin):
    list_display = ['user',
                    'ordered',
                    'being_delivered',
                    'received',
                    'refund_requested',
                    'refund_granted',
                    'billing_address',
                    'shipping_address',
                    'payment',
                    'coupon'
                    ]

    list_display_links = ['user',
                          'billing_address',
                          'shipping_address',
                          'payment',
                          'coupon'
                          ]

    list_filter = ['ordered',
                   'being_delivered',
                   'received',
                   'refund_requested',
                   'refund_granted'
                   ]

    search_fields = [
        'user__username',
        'ref_code',
    ]

    actions = [accept_refund, order_en_route]


class AddressAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'street_address',
        'apartment_address',
        'country',
        'zip',
        'address_type',
        'default',
    ]
    list_filter = [
        'default',
        'address_type',
        'country',
    ]
    search_fields = [
        'user',
        'street_address',
        'apartment_address',
        'zip'
    ]


class ItemVariationAdmin(admin.ModelAdmin):
    list_display = ['variation', 'value', 'attachment']
    list_filter = ['variation', 'variation__item']
    search_fields = ['value']


class ItemVariationInLineAdmin(admin.TabularInline):
    model = ItemVariation
    extra = 1


class VariationAdmin(admin.ModelAdmin):
    list_display = ['item', 'name']
    list_filter = ['item']
    search_fields = ['name']
    inlines = [ItemVariationInLineAdmin]


admin.site.register(Item)
admin.site.register(OrderItem)
admin.site.register(Order, OrderAdmin)
admin.site.register(Payment)
admin.site.register(Coupon)
admin.site.register(Refund)
admin.site.register(Address, AddressAdmin)
admin.site.register(UserProfile)
admin.site.register(ItemVariation, ItemVariationAdmin)
admin.site.register(Variation, VariationAdmin)
