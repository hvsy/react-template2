import { useState } from "react";

export function useTableSelected(mode : 'key'|'all' = 'key') {
    const [selectedKeys,setSelectedKeys] = useState<any[]>([]);
    return [selectedKeys,{
        selectedRowKeys : mode =='key' ? selectedKeys  : selectedKeys.map((item) => {
            return item['id'];
        }),
        onChange : (newSelectedRowKeys : any[],selectedRows : any[]) => {
            if(mode ==='key'){
                setSelectedKeys(newSelectedRowKeys);
            }else{
                setSelectedKeys(selectedRows);
            }
        }
    }] as const;
}
