import {FC, ReactNode, useMemo} from "react";
import {Button, ButtonProps} from "antd";
import {useAsyncClick} from "@hooks/useAsyncClick";
import {CheckOutlined, WarningOutlined} from "@ant-design/icons";

export type AsyncButtonProps =  Omit<ButtonProps,'onClick'> & {
    onClick ?: ()=>(Promise<any>|void);
    children ?: ReactNode,
} ;

export const AsyncButton : FC<AsyncButtonProps> = (props)=>{
    const {children,onClick,loading : tLoading,icon : originalIcon,...others} = props;
    const [{loading,success,error},click]  = useAsyncClick(onClick);
    const icon = useMemo(() => {
        if(success)   {
            return <CheckOutlined className={'text-blue-500'}/>
        }
        if(error){
            return <WarningOutlined className={'text-red-500'} />
        }
        return null;
    },[success,error]);
    return <Button {...others} icon={icon || originalIcon} loading={loading} onClick={click}>
        {children}
    </Button>;
};
