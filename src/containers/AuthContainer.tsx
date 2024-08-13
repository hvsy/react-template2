import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {AxiosInstance} from "@/lib/api";
import _ from "lodash";
import useSWR, { KeyedMutator } from "swr";
import {LoadingOutlined} from "@ant-design/icons";
import {message} from "antd";

export type AuthContainerProps = {
    redirect : string;
    user : string;
    children : ReactNode,
    excludes ?: (string|RegExp)[],
};

export type UserContextValues = {
    user:User|null;
    refresh : (KeyedMutator<any>)|null;
};
const UserContext = createContext<UserContextValues>({
    user : null,
    refresh : null,
});

export function useUser(){
    const ctx= useContext(UserContext)!;
    return [ctx.user!,ctx.refresh!] as const;
}


export function UserProvider(props : {url : string,children : ReactNode}){
    const {url,children} = props;
    const {data,mutate} = useSWR(url);
    if(!data){
        return <div className={'flex-1 flex flex-col justify-center items-center'}>
            <LoadingOutlined />
        </div>;
    }
    return <UserContext.Provider value={{user:data,refresh : mutate}}>
        {children}
    </UserContext.Provider>
}


export function AuthContainer(props : AuthContainerProps){
    const {redirect,user,excludes} = props;
    const nav =useNavigate();
    const location = useLocation();
    const path = location.pathname;
    const [mounted,setMounted] = useState(false);
    useEffect(() => {
        const interceptor = AxiosInstance.interceptors.response.use(r=>r, (error) => {
            const isRedirect = _.get(error,'config.authRedirect',true);
            const status = _.get(error,'response.status');
            if(status === 401 && isRedirect){
                nav(redirect);
                return;
            }else if(status === 403){
                message.error(_.get(error,'response.message','您无权进行该项操作'));
            }
            return Promise.reject(error);
        });
        setMounted(true);
        return () => {
            AxiosInstance.interceptors.response.eject(interceptor);
            setMounted(false);
        }
    },[]);
    const excluded = useMemo(() => {
        if(!!excludes?.length){
            for (const item of excludes) {
                switch(typeof  item){
                    case 'string':
                        if(item === path){
                            return true
                        }
                        break;
                    case 'object':
                        if(item.test(path)){
                            return true;
                        }

                }
                return false
            }
        }
    },[path,excludes?.join('|')]);
    if(excluded) return <Outlet/>;
    if(!mounted) return null;
    return <UserProvider url={user}>
        {props.children}
    </UserProvider>
}
