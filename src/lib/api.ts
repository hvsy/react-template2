import axios, {AxiosRequestConfig} from "axios";
import {Token} from "./token";
import _ from "lodash";

function getBaseUrl(){
    if(import.meta.env.VITE_API) return import.meta.env.VITE_API;
    if(import.meta.env.VITE_BASE) return _.trimEnd(import.meta.env.VITE_BASE,'/') + '/api/';
    return '/';
}
export const AxiosInstance = axios.create({
    baseURL :getBaseUrl(),
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept' : 'application/json',
    },
    withCredentials: false,
});
AxiosInstance.interceptors.request.use((config) => {
    const token = Token.get();
    if(token && config.headers){
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});
AxiosInstance.interceptors.response.use(r=>r, (error) => {
    const statusCode = _.get(error,'response.status');
    if(!statusCode && _.get(error,'message') === 'Network Error'){
        console.error('无法访问:',error.config.baseURL + error.config.url);
    }else if(statusCode === 401){
        Token.remove();
    }
    return Promise.reject(error);
});
export function api<T = any>(config : AxiosRequestConfig & {authRedirect ?: boolean}){
    return AxiosInstance.request<T>(config).then(r=>r.data);
}



