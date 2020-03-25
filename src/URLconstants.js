// define all API data to be queried
const apiURL = '/api';

// dev
// const localhost = 'http://localhost:8000';
// export const endpoint = `${localhost}${apiURL}`;

// prod
const heroku = 'https://ecommerce3-nwachuku.herokuapp.com';
export const endpoint = `${heroku}${apiURL}`;




export const userIDURL = `${endpoint}/user-id/`;
export const countryListURL = `${endpoint}/countries/`;
export const productListURL = `${endpoint}/products/`;
export const productDetailURL = id => `${endpoint}/products/${id}/`;
export const orderItemUpdateQuantityURL = `${endpoint}/order-item/update-quantity/`
export const orderItemDeleteURL = id => `${endpoint}/order-items/${id}/delete/`;
export const addToCartURL = `${endpoint}/add-to-cart/`;
// export const fetchCart = `${endpoint}/fetch-cart/`;
export const orderSummaryURL = `${endpoint}/order-summary/`;
export const checkoutURL = `${endpoint}/checkout/`;
export const addCouponURL = `${endpoint}/add-coupon/`;
export const addressListURL = addressType => `${endpoint}/addresses/?address_type=${addressType}`;
export const addressCreateURL = `${endpoint}/addresses/create/`;
export const addressUpdateURL = id => `${endpoint}/addresses/${id}/update/`;
export const addressDeleteURL = id => `${endpoint}/addresses/${id}/delete/`;
export const addressMakeDefaultURL = `${endpoint}/addresses/make-default/`;
export const addressRemoveDefaultURL = `${endpoint}/addresses/remove-default/`;
export const paymentListURL = `${endpoint}/payments/`;
