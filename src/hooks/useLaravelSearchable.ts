import qs from "qs";
import {CustomSearchableType} from "./useCustomSearch";
import {format, useSearchable} from "./useSearchable";


export function useLaravelSearchable(url : string,type : CustomSearchableType = 'url',initialValues : any = {}){
    return useSearchable(url, () => {
        let defaultValues = ({page : 1,page_size : 15,...initialValues});
        if(type === 'url'){
            defaultValues = {
                ...defaultValues,
                ...qs.parse(window.location.search.replace('?','')),
            }
        }
        return new URLSearchParams(format(defaultValues));
    },type);
}
