import axios from 'axios';
import {endpoint} from './URLconstants'

// This will authorize post requests
export const authAxios = axios.create({
   baseURL: endpoint,
   headers: {
      Authorization: `Token ${localStorage.getItem('token')}`
   }
})