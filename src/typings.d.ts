type User = {
    id : number;
    name : string;
    role ?: string;
    faker ?: {
        name : string;
    };
    abilities ?: string[];
};


type ReactClassComponent<T extends any = {}> = new(...args: any[]) => React.Component<T, any>;

type ReactComponent<T extends any = {}> = ReactClassComponent<T> | React.FC<T>;

type CustomFormField<T extends any = any> = {
    placeholder ?: string|React.ReactNode;
    value ?: T,
    onChange  ?: (value : T)=>void;
    multiple ?: boolean;
    className?:string;
}
