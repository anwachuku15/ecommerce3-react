// define all API data to be queried

const localhost = 'http://localhost:8000';
const apiURL = '/api';
export const endpoint = `${localhost}${apiURL}`;

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
export const countryListURL = `${endpoint}/countries/`;
export const userIDURL = `${endpoint}/user-id/`;