from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from core.models import *
from .serializers import *
from django_countries import countries

import random
import string

import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class UserIDView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({'userID': request.user.id}, status=HTTP_200_OK)


def create_ref_code():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=20))


class ItemListView(ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ItemSerializer
    queryset = Item.objects.all()


class ItemDetailView(RetrieveAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ItemDetailSerializer
    queryset = Item.objects.all()


class AddToCartView(APIView):
    def post(self, request, *args, **kwargs):
        slug = request.data.get('slug', None)
        variations = request.data.get('variations', [])
        if slug is None:
            return Response({'message': 'Invalid request'}, status=HTTP_400_BAD_REQUEST)
        item = get_object_or_404(Item, slug=slug)

        minimum_variation_count = Variation.objects.filter(item=item).count()
        if len(variations) < minimum_variation_count:
            return Response({'message': 'Please specifiy color and size'}, status=HTTP_400_BAD_REQUEST)

        order_item_qs = OrderItem.objects.filter(
            item=item,
            user=request.user,
            ordered=False
        )

        for v in variations:
            order_item_qs = order_item_qs.filter(
                item_variations__exact=v
            )

        if order_item_qs.exists():
            order_item = order_item_qs.first()
            order_item.quantity += 1
            order_item.save()
        else:
            order_item = OrderItem.objects.create(
                item=item,
                user=request.user,
                ordered=False
            )
            order_item.item_variations.add(*variations)
            order_item.save()

        cart = Order.objects.filter(user=request.user, ordered=False)
        if cart.exists():
            order = cart[0]
            if not order.items.filter(item__id=order_item.id).exists():
                order.items.add(order_item)
            return Response(status=HTTP_200_OK)

        else:
            ordered_date = timezone.now()
            order = Order.objects.create(
                user=request.user, ordered_date=ordered_date)
            order.items.add(order_item)
            return Response(status=HTTP_200_OK)


class OrderDetailView(RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        try:
            order = Order.objects.get(user=self.request.user, ordered=False)
            return order

        except ObjectDoesNotExist:
            raise Http404('You do not have an active order')


class OrderItemDeleteView(DestroyAPIView):
    permission_classes = (IsAuthenticated,)
    queryset = OrderItem.objects.all()


class OrderQuantityUpdateView(APIView):
    def post(self, request, *args, **kwargs):
        slug = request.data.get('slug', None)
        variations = request.data.get('variations', [])
        if slug is None:
            return Response({'message': 'Invalid data'}, status=HTTP_400_BAD_REQUEST)
        item = get_object_or_404(Item, slug=slug)
        print(variations)

        cart = Order.objects.filter(user=request.user, ordered=False)
        if cart.exists():
            order = cart[0]

            if order.items.filter(item__slug=item.slug).exists():

                for v in variations:
                    order_item_qs = OrderItem.objects.filter(
                        user=request.user, item=item, item_variations__exact=v, ordered=False)

                if order_item_qs.exists():
                    order_item = order_item_qs.first()

                    if order_item.quantity > 1:
                        order_item.quantity -= 1
                        order_item.save()
                    else:
                        order_item.delete()
                    # order.items.remove(order_item)
                    return Response(status=HTTP_200_OK)
            else:
                return Response({'message': 'This item is not in your cart'}, status=HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'You do not have an active order'}, status=HTTP_400_BAD_REQUEST)


class PaymentView(APIView):
    def post(self, request, *args, **kwargs):
        order = Order.objects.get(user=self.request.user, ordered=False)
        userprofile = UserProfile.objects.get(user=self.request.user)
        token = request.data.get('stripeToken')
        billing_address_id = request.data.get('selectedBillingAddress')
        shipping_address_id = request.data.get('selectedShippingAddress')

        billing_address = Address.objects.get(id=billing_address_id)
        shipping_address = Address.objects.get(id=shipping_address_id)

        if userprofile.stripe_customer_id != '' and userprofile.stripe_customer_id is not None:
            customer = stripe.Customer.retrieve(userprofile.stripe_customer_id)
            customer.sources.create(source=token)
        else:
            customer = stripe.Customer.create(email=self.request.user.email)
            customer.sources.create(source=token)
            userprofile.stripe_customer_id = customer['id']
            userprofile.one_click_purchasing = True
            userprofile.save()

        amount = int(order.get_total() * 100)
        # Handling errors: https://stripe.com/docs/api/errors/handling?lang=python
        try:

            # if use_default_card or save_card:
            charge = stripe.Charge.create(
                amount=amount,
                currency="usd",
                # customer contains source
                customer=userprofile.stripe_customer_id
            )
            # else:
            # charge = stripe.Charge.create(
            #     amount=amount,
            #     currency="usd",
            #     source=token
            # )

            # Create Payment
            payment = Payment()
            payment.stripe_charge_id = charge['id']
            payment.user = self.request.user
            payment.amount = order.get_total()
            payment.save()

            # Assign payment to order
            for order_item in order.items.all():
                order_item.ordered = True
                order_item.save()

            order.ordered = True
            order.payment = payment
            order.billing_address = billing_address
            order.shipping_address = shipping_address
            order.ref_code = create_ref_code()
            order.save()

            return Response(status=HTTP_200_OK)

        except stripe.error.CardError as e:
            # Since it's a decline, stripe.error.CardError will be caught
            body = e.json_body
            err = body.get('error', {})
            return Response({"message": f"{err.get('message')}"}, status=HTTP_400_BAD_REQUEST)

        except stripe.error.RateLimitError as e:
            # Too many requests made to the API too quickly
            return Response({"message": "Rate limit error"}, status=HTTP_400_BAD_REQUEST)

        except stripe.error.InvalidRequestError as e:
            # Invalid parameters were supplied to Stripe's API
            return Response({"message": "Invalid parameters"}, status=HTTP_400_BAD_REQUEST)

        except stripe.error.AuthenticationError as e:
            # Authentication with Stripe's API failed
            # (maybe you changed API keys recently)
            return Response({"message": "Not authenticated"}, status=HTTP_400_BAD_REQUEST)

        except stripe.error.APIConnectionError as e:
            # Network communication with Stripe failed
            return Response({"message": "Network error"}, status=HTTP_400_BAD_REQUEST)

        except stripe.error.StripeError as e:
            # Display a very generic error to the user, and maybe send
            # yourself an email
            return Response({"message": "Something went wrong. You were not charged. Please try again."}, status=HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Something else happened, completely unrelated to Stripe
            # Send an email to ourselves
            return Response({"message": "A serious error occured. We have been notified."}, status=HTTP_400_BAD_REQUEST)

        return Response({"message": "Invalid data received"}, status=HTTP_400_BAD_REQUEST)


class AddCouponView(APIView):
    def post(self, request, *args, **kwargs):
        # TODO: Coupon validations: Duplicates, number of coupons, etc...
        code = request.data.get('code', None)
        if code is None:
            return Response({'message': 'Invalid data received'}, status=HTTP_400_BAD_REQUEST)

        order = Order.objects.get(user=self.request.user, ordered=False)
        coupon = get_object_or_404(Coupon, code=code)
        order.coupon = coupon
        order.save()
        return Response({'message': "Succesfully added coupon"}, status=HTTP_200_OK)


class AddressListView(ListAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = AddressSerializer

    def get_queryset(self):
        address_type = self.request.query_params.get('address_type', None)
        qs = Address.objects.all()
        if address_type is None:
            return qs
        return qs.filter(user=self.request.user, address_type=address_type)


class AddressCreateView(CreateAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = AddressSerializer
    queryset = Address.objects.all()


class AddressUpdateView(UpdateAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = AddressSerializer
    queryset = Address.objects.all()


class AddressMakeDefaultView(APIView):
    # pass
    def post(self, request, *args, **kwargs):
        selected_address = request.data.get('address', None)
        if selected_address is None:
            return Response(status=HTTP_400_BAD_REQUEST)
        print(selected_address['id'])
        address_qs = Address.objects.filter(id=selected_address['id'])

        address = address_qs.first()
        address.default = True
        address.save()
        return Response(status=HTTP_200_OK)


class AddressRemoveDefaultView(APIView):
    def post(self, request, *args, **kwargs):
        selected_address = request.data.get('address', None)
        if selected_address is None:
            return Response(status=HTTP_400_BAD_REQUEST)
        print(selected_address['id'])
        address_qs = Address.objects.filter(id=selected_address['id'])

        address = address_qs.first()
        address.default = False
        address.save()
        return Response(status=HTTP_200_OK)


class AddressDeleteView(DestroyAPIView):
    permission_classes = (IsAuthenticated, )
    queryset = Address.objects.all()


class CountryListView(APIView):
    def get(self, request, *args, **kwargs):
        return Response(countries, status=HTTP_200_OK)
