import {useSimpleDialogActions} from "./useSimpleDialogActions";

export type ModelDialogActions<T = any> = {
    create : (e ?: React.MouseEvent<HTMLElement>)=>void;
    edit: (id : T)=>void;
    close : (e ?: React.MouseEvent<HTMLElement>)=>void;
};
export function useModelDialogActions<T>() : readonly [boolean,ModelDialogActions,T|undefined|null]{
    const [show,dlg,id] = useSimpleDialogActions<T>();
    const actions = {
        create(e ?: React.MouseEvent<HTMLElement>) {
            e && e.stopPropagation && e.stopPropagation();
            e && e.preventDefault &&e.preventDefault();
            dlg.show();
        },
        edit(id: T) {
            dlg.show(id);
        },
        close(e ?: React.MouseEvent<HTMLElement>){
            e && e.stopPropagation && e.stopPropagation();
            e && e.preventDefault &&e.preventDefault();
            dlg.close();
        },
    };
    return [show,actions,id] as const;
}
