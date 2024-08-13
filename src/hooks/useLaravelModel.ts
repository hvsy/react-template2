import { api } from "@/lib/api";
import useSWR, { SWRResponse } from "swr";

export type ModelMethod = 'create' | 'update';
export type LaravelModelCallback = (data : any,type : ModelMethod)=>any;

export function useLaravelModel<T = any,ID extends string|number = string|number>(target : string,callback ?: LaravelModelCallback) : LaravelModelActions<T, ID>{
    return {
        creator(values : Partial<T>){
            const data = callback ? callback(values,'create') : values;
            return api<T>({
                method : 'post',
                url : target,
                data,
            });
        },
        destroyer(id:ID){
            const url = `${target}/${id}`;
            return api({
                method : "delete",
                url,
            })
        },
        updator(id : ID,values : any){
            return api<T>({
                method : 'put'   ,
                url : `${target}/${id}`,
                data : callback? callback(values,'update') : values,
            })
        },
        useFetch(id:ID){
            return useSWR<T>(id ? `${target}/${id}` : null);
        }
    }
}

export type LaravelModelActions<T extends any,ID extends string|number> = {
    creator : (values : Partial<T>)=>Promise<T>;
    destroyer : (id : ID)=>Promise<any>;
    updator : (id:ID,values : Partial<T>)=>Promise<T>;
    useFetch : (id : ID)=>SWRResponse<T, any>;
}
