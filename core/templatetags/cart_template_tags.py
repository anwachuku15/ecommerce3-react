from django import template
from core.models import Order

register = template.Library()


@register.filter
def cart_item_count(user):
    if user.is_authenticated:
        cart = Order.objects.filter(user=user, ordered=False)
        if cart.exists():
            total_quantity = 0
            for order_item in cart[0].items.all():
                total_quantity += order_item.quantity
            return total_quantity
            # return cart[0].items.count()
    return 0
