import {DialogProps} from "@/ui/fragments/Dialog";
import {LaravelModelActions, LaravelModelCallback, useLaravelModel} from "@/hooks/useLaravelModel";
import {useModelDialogActions} from "@/ui/hooks/useModelDialogActions";
import {useLaravelForm} from "@/hooks/useLaravelForm";
import {App} from "antd";
import {useComponentDialog} from "@/ui/fragments/ComponentDialog";
import {FC} from "react";
import _ from "lodash";

export type UseModelDialogOptions = Omit<DialogProps,'label'|'footer'> & {
    label ?: string;
    footer ?: React.ReactNode|ReactComponent<any>
    onSubmitted ?: Function;
    onlyTouch ?: boolean;
};
export const ModelFormContainer :FC<{
    component : ReactComponent<any>;
    model : LaravelModelActions<any, any>,
    id ?: any;
    options : UseModelDialogOptions,
    close ?: Function;
}> = (props) => {
    const {model,id,close,options,component,} = props;
    const {label,onSubmitted,...others} = options;
    const {data,isLoading,mutate} = model.useFetch(id);
    const app = App.useApp();
    const [form,laravel] = useLaravelForm(async (values) => {
        let data;
        if(id){
            data = await model.updator(id!,values);
            mutate(data);
        }else{
            data = await model.creator(values);
        }
        app.notification.success({
            type : 'success',
            message : id ? '修改成功':'创建成功',
        });
        onSubmitted && onSubmitted(data);
        if(data){
            return data;
        }
    });
    const cancel = () => {
        laravel.reset();
        close && close();
    };
    // @ts-ignore
    const dlg = useComponentDialog<T>(component,{
        open: true,
        key : id || `create-${label}`,
        loading :id ? isLoading : false,
        title : id ? `编辑${label}` : `新建${label}`,
        id,
        formProps :{
            form,
            initialValues: data || {},
            onFieldsChange: laravel.onFieldsChange
        },
        cancel,
        ...others,
        ...laravel,
    });
    return dlg;
};

export function useModelDialog<T extends object>(component: ReactComponent<T>|undefined,model: string|LaravelModelActions<any, any>,options : UseModelDialogOptions & {
    modelCallback?:LaravelModelCallback,
} = {}){
    const [show,actions,id] = useModelDialogActions();

    let dlg = null;
    const {modelCallback,...otherOptions} = options;
    if(show && component){
        const modelKey : any = {

        };
        if(id && _.isString(id)){
            modelKey.key = id;
        }
        dlg = <ModelFormContainer
            component={component}
            model={_.isString(model) ? useLaravelModel(model,modelCallback) : model}
            id={id}
            {...modelKey}
            close={actions.close}
            options={otherOptions}
        />;
    }

    return [dlg,{
        create : actions.create,
        edit : actions.edit,
        close,
        delete(id : string|number){
            return (_.isString(model) ? useLaravelModel(model) : model).destroyer(id);
        }
    },] as const;
}
