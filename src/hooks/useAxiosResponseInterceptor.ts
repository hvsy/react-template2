import {useEffect, useState} from "react";
import {AxiosInstance} from "@/lib/api";
import {AxiosResponse} from "axios";

export function useAxiosResponseInterceptor(onFulfilled ?:(value: AxiosResponse<any,any>) => AxiosResponse<any,any> | Promise<AxiosResponse<any,any>>, onRejected?: (error: any) => any){
    const [mounted,setMounted] = useState(false);
    useEffect(() => {
        const interceptor = AxiosInstance.interceptors.response.use(onFulfilled,onRejected);
        setMounted(true);
        return () => {
            AxiosInstance.interceptors.response.eject(interceptor);
            setMounted(false);
        }
    },[]);
    return mounted;
}
