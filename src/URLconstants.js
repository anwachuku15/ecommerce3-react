// define all API data to be queried

const localhost = 'http://localhost:8000';
const apiURL = '/api';
export const endpoint = `${localhost}${apiURL}`;

export const productListURL = `${endpoint}/product-list/`;
export const addToCartURL = `${endpoint}/add-to-cart/`;
export const fetchCart = `${endpoint}/fetch-cart/`;