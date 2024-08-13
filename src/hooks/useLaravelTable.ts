import {LaravelListOptions, LaravelPagination, useLaravelList} from "./useLaravel";
import {SpinProps, TableProps} from "antd";
import {useState} from "react";
import {useSearchParams} from "react-router-dom";
import {MutateCallback, useMatchMutate} from "@/hooks/useMatchMutate";
import { GetRowKey } from "antd/lib/table/interface";
import { KeyedMutator } from "swr";
import _ from "lodash";
import {Searchable} from "./useSearchable";

export type RouteType = 'memory' | 'url';
export type LaravelTableOptions<Data> = TableProps<Data> & {
    route ?: RouteType,
    requestOptions ?: LaravelListOptions<LaravelPagination<Data>>,
}
export function useQueryParams(type : RouteType){
    const memory = useState<any>({});
    const url = useSearchParams();

}
export type LaravelTable<Data = any> = {
    refresh : ()=>void;
    modify : (id : string|number,data : Data,merge ?: boolean)=>Promise<LaravelPagination<Data>|undefined>;
    dataSource ?: readonly Data[],
    rowKey : string | keyof Data | GetRowKey<Data>,
    pagination : any;
    loading : boolean|SpinProps;
    mutate : KeyedMutator<LaravelPagination<Data>>,
};
export function useLaravelTable<Data extends any = any>(searchable: Searchable|null,options : LaravelTableOptions<Data> = {}) : LaravelTable<Data>{
    const {route = 'url',requestOptions,rowKey = 'id',...otherOptions} =  options;
    const {data,pagination,mutate,modify,isValidating,isLoading,onChange}=useLaravelList<Data>(searchable,requestOptions);
    const match = useMatchMutate();
    return {
        mutate,
        refresh(){
            if(searchable){
                match(searchable.url).catch();
            }
            // mutate();
        },
        modify(id : string|number,data : Data,merge : boolean = false){
            return modify((t : any)=>{
                const mainKey = rowKey ? (_.isFunction(rowKey) ?  rowKey(t) : t[rowKey]) : (t['id']);
                // (t as any)['id'] === id
                return mainKey === id;
            },data,merge);
        },
        dataSource : data,
        rowKey,
        onChange,
        pagination,
        loading : isValidating || isLoading,
        ...otherOptions,
    }
}
