import axios from "axios";
import * as actionTypes from "./actionTypes";
import { authAxios } from "../../utils";
import {fetchCart} from "../../URLconstants"

export const cartStart = () => {
   return {
    type: actionTypes.CART_START
   };
};

export const cartSuccess = data => {
   console.log(data)
   return {
      type: actionTypes.CART_SUCCESS,
      token: token
   };
};

export const cartFail = error => {
   return {
      type: actionTypes.CART_FAIL,
      error: error
   };
};

export const cartFetch = () => {
   return dispatch => {
     dispatch(cartStart());
     authAxios
      .post(fetchCart)
      .then(res => {
         dispatch(cartSuccess(res.data));
      })
      .catch(err => {
         dispatch(cartFail(err));
      });
   );
};
