import {useCallback, useEffect, useMemo,} from "react";
import {useMatchMutate} from "@/hooks/useMatchMutate";
import _ from "lodash";
import {CustomSearchableType, useCustomSearch, UseCustomSearchCallback} from "@/hooks/useCustomSearch";
import qs from "qs";
export function format(data : any){
    return qs.stringify(data,{
        arrayFormat : 'brackets',
        serializeDate : function (date) {
            return date.toUTCString();
        }
    });
}

function setter(set : any,original : any,merge : boolean = false){
    const to = _.isFunction(set) ? set(original) : set;
    if(merge){
        return {
            ...original,
            ...to,
        }
    }else{
        return to;
    }
}

export type Searchable = {
    search: URLSearchParams;
    setSearch : (params :string|URLSearchParams)=>void;
    set : (plain : any)=>void;
    replace : (base : string,page ?: boolean|string[])=>string;
    url : string | null;
    refresh : Function;
    has :(key : string)=>boolean;
};
export function useSearchable(url : string|null, callback ?: UseCustomSearchCallback, type :CustomSearchableType = 'memory',) : Searchable{
    const [search,setSearch] = useCustomSearch(type,callback);
    const mutate = useMatchMutate();
    const refresh = useCallback(()=>{
          return mutate(url);
    },[url]);
    // const exceptPage = useMemo(() => {
    //     const newSearch = new URLSearchParams(search);
    //     newSearch.delete('page');
    //     newSearch.delete('page_size');
    //     return newSearch;
    // },[search]);
    // console.log('url:',url,'except page:',exceptPage.toString());

    // useEffect(() => {
    //     if(search.has('page') && search.get('page') != '1'){
    //         console.log('change page');
    //         const after = new URLSearchParams(search);
    //         after.set('page','1');
    //         setSearch(after);
    //     }
    // },[url,exceptPage.toString()]);
    return {
        search,
        setSearch(content :string|URLSearchParams){
            let after = content;
            if(_.isString(content) && type ==='memory'){
                after = new URLSearchParams(content);
            }
            setSearch(after as URLSearchParams);
        },
        set(plain : any){
            const newURLSearchParams = new URLSearchParams(format(plain));
            setSearch(newURLSearchParams);
        },
        has(key : string){
            return search.has(key);
        },
        replace(base : string,page :boolean | string[] = true){
            if(page === true){
                page = ['page','page_size'];
            }else if(page === false){
                page = [];
            }
            let qs = '';
            if(!_.isEmpty(page)){
                const newSearch = new URLSearchParams(search);
                for (const entry in search.keys()) {
                    if(page.includes(entry)){
                        newSearch.delete(entry);
                    }
                }
                qs = newSearch.toString();
            }else{
                qs = search.toString();
            }
            const symbol: string = base.includes('?') ? '&' : '?';
            return qs ? `${base}${symbol}${qs}` : base;
        },
        get url(){
            if(!url) return null;
            const qs = search.toString();
            const symbol: string = url.includes('?') ? '&' : '?';
            return qs ? `${url}${symbol}${qs}` : url;
        },
        refresh,
    }

}
