import axios from 'axios';
import {endpoint} from './URLconstants'
import { authToken } from './store/actions/auth'


export const authAxios = axios.create({
   baseURL: endpoint,
   headers: {
      Authorization: `Token ${localStorage.getItem('token')}`
   }
})