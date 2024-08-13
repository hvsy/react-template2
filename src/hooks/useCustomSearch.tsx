import {useCallback, useState} from "react";
import {useSearchParams} from "react-router-dom";

export type CustomSearchableType = 'memory' | 'url';
export type UseCustomSearchCallback = ()=> URLSearchParams;
export function useMemorySearch(callback ?: (()=>URLSearchParams)){
    const [search,setSearch] = useState<URLSearchParams>(() => {
        return callback ? callback(): new URLSearchParams();
    });
    const set = useCallback((search : URLSearchParams) => {
        setSearch(new URLSearchParams(search));
    },[]);
    return [search,set] as const;
}
export function useCustomSearch(type : CustomSearchableType = 'memory',callback?: UseCustomSearchCallback){
    const [search,setSearch] = type  ==='memory' ? useMemorySearch(callback) : useSearchParams(callback ? callback() : undefined);
    return [search,setSearch] as const;
}
