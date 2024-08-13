import {useCallback, useEffect, useState} from "react";
import useSWR, {BareFetcher, SWRConfiguration} from "swr";
import useSWRInfinite from 'swr/infinite'

import {TablePaginationConfig, TableProps} from "antd";
import _ from "lodash";
import {Searchable} from "./useSearchable";
import {PaginationConfig} from "antd/es/pagination";

export type LaravelPagination<T extends any> = {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string;
    path: string;
    per_page: number;
    prev_page_url: string;
    to: number;
    total: number;
};

export type LaravelListOptions<Data> = {
    initialPageSize ?: number;
    fetcher ?: BareFetcher<Data> | null;
    swr ?: SWRConfiguration;
};
export function useLaravelList<Data = any,Error = any>(searchable: Searchable|null, options : LaravelListOptions<LaravelPagination<Data>> = {initialPageSize : 20, fetcher : null}){
    const {initialPageSize = 20,fetcher = null,swr} = options;
    let finalUrl = searchable?.url;
    const {
              data,
              ...others
          } = useSWR<LaravelPagination<Data>,Error>(finalUrl,fetcher,swr);
    const actions = {
        onlyOne(){
            return data?.total === 1;
        },
        isFirst(){
            return data?.current_page === 1;
        },
        isLast(){
            return data?.current_page === data?.last_page;
        },
    };
    const pagination: undefined| PaginationConfig = data ? {
        onChange(page: number, pageSize: number){
            // setPage(page);
            // setPageSize(pageSize);
        },
        pageSizeOptions : [20,30,50,100],
        showSizeChanger : true,
        showTotal(total){
            return `总数 : ${total}`;
        },
        current: data.current_page,
        pageSize: data.per_page,
        total: data.total,
        hideOnSinglePage : true,
    } : undefined;
    const onChange : TableProps<any>['onChange'] = (pagination1, filters, sorter, extra) => {
        if(searchable){
            const params = new URLSearchParams(searchable.search);
            params.set('page',pagination1.current + '');
            params.set('page_size',pagination1.pageSize + '');
            const s = (_.isArray(sorter) ? sorter : [sorter])?.[0];
            if(s && s.order && s.field){
                const key = _.isArray(s.field)? s.field : [s.field];
                [key.join('.'),s.order].forEach((v) => {
                  params.append('sort[]',v);
                });
            }else{
                params.delete('sort[]');
            }
            Object.keys(filters).forEach((key) => {
                if(filters.hasOwnProperty(key))  {
                    const filter = filters[key];
                    params.delete(key);
                    if(_.isArray(filter)){
                        filter.forEach((v,k) => {
                            params.append(`${key}[]`,v + '');
                        });
                    }else{
                        params.set(key,filter + '');
                    }

                }
            });
            searchable.setSearch(params);
        }
    };
    return {
        data : data?.data,
        next(){
            if(!actions.isLast()){
                if(!searchable) return;
                const page = searchable.search.get('page') as string;
                const newParams = new URLSearchParams(searchable.search);
                newParams.set('page',(parseInt(page) + 1) + '');
                searchable.setSearch(newParams);
                // setPage(page + 1);
            }
        },

        prev(){
            if(!actions.isFirst()){
                if(!searchable) return;
                if(!searchable) return;
                const page = searchable.search.get('page') as string;
                const newParams = new URLSearchParams(searchable.search);
                newParams.set('page',(parseInt(page) - 1) + '');
                searchable.setSearch(newParams);
                // setPage(page - 1);
            }
        },

        onChange,
        modify: function (hit : (data:Data)=>boolean, data: Data,merge : boolean = false) {
            return others.mutate(async (response ?: LaravelPagination<Data>) => {
                if (!response) return undefined;
                const cloned = {
                    ...response,
                    data: [...response.data],
                };
                const idx = _.findIndex(cloned.data,hit);
                if(idx !== -1){
                    if(merge){
                        cloned.data[idx] = {...cloned.data[idx],...data};
                    }else{
                        cloned.data[idx] = data;
                    }
                }
                return cloned;
            },{
                revalidate : false,
            })
        },
        pagination,
        ...actions,
        ...others,
    };
}
export type LaravelListReturn = ReturnType<typeof useLaravelList>;

function getKey<T>(url : string|null){
    return (pageIndex : number,previousPageData : LaravelPagination<T>) => {
        if(!url) return null;
        console.log("infinite:", url,previousPageData,pageIndex);
        if(previousPageData && previousPageData.data.length === 0){
            return null;
        }
        if(pageIndex === 0){
            return url;
        }
        const [ path, qs = '' ] = url!.split('?');
        const query = new URLSearchParams(qs || '');
        query.set('page', (pageIndex + 1) + '');
        return [ path, query.toString() ].join('?');
    }
}
export function useLaravelInfinite<T = any>(url: string | null,options : LaravelListOptions<LaravelPagination<T>> = {initialPageSize : 10, fetcher : null}){
    const {initialPageSize = 10,fetcher = null,swr} = options;
    const keyer = useCallback((page : number,pp : any) => {
        return getKey(url)(page,pp);
    },[url]);
    const {data,isValidating,size,setSize,mutate,error,isLoading} =useSWRInfinite<LaravelPagination<T>>(keyer,fetcher,swr);
    const isLoadingInitialData = !data && !error;
    const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === "undefined");
    const isEmpty = data?.[0]?.data?.length === 0;
    const isReachingEnd = isEmpty || (data && data?.[data.length - 1]?.data?.length < initialPageSize);
    const isRefreshing = isValidating && data && data?.length === size;
    // const pages = (data||[]).map((i : LaravelPagination<T>) => {
    //     return i.data;
    // });
    return {
        data : ([] as T[]).concat(...(data||[]).filter(t=>!!t).map((i) => {
            return i.data;
        })),
        isLoading,
        isLoadingInitialData,
        isLoadingMore,
        isReachingEnd,
        isRefreshing,
        mutate,
        error,
        async next(){
            if(!isEmpty && !isReachingEnd){
                await setSize((s)=>{
                    console.log('prev:',s,'next:',s+1);
                    return s+1;
                });
            }
        }

    }
}
