import {FC, ReactNode,  useState} from "react";
import {Button, Form, Modal} from "antd";
import {useLaravelForm} from "@/hooks/useLaravelForm";
import {useGlobalConfig} from "@/containers/GlobalConfigContainer";
import {FilterOutlined} from "@ant-design/icons";

export type TableSearchFormProps = {
    children?: ReactNode;
    className?: string;
    onSubmit: (values: any) => Promise<void>;
    type?: 'grid' | 'flex';
    touched?: boolean;
    initialValues ?: any;
    reset ?: Function;
    showReset ?: boolean;
    searchText ?: ReactNode;
};

const SubmitButton = (props : any) => {
    const {laravel,form,children} = props;
    return <Button onClick={() => {
        laravel.submit().catch(()=>{});
    }} type="primary" disabled={!form.isFieldsTouched()}>
        {children}
    </Button>
};
export const TableSearchForm: FC<TableSearchFormProps> = (props) => {
    const {children,searchText ='搜索',reset,showReset = true, touched = false, type = 'grid',initialValues, className = '', onSubmit} = props;
    const finalClassName = `px-4 py-4 ${type} grid-cols-4  sm:grid-cols-1 gap-4 form-0-margin ${className}`;
    const [show, setShow] = useState(false);
    const isMobile = useGlobalConfig().isMobile;
    const [form, laravel] = useLaravelForm(onSubmit);
    const content = <Form form={form}
                          layout={isMobile ? "vertical" : 'horizontal'}
                          className={`ant-form ${isMobile ? 'ant-form-vertical overflow-y-auto' : finalClassName} `}
                          initialValues={initialValues}
                          onKeyUp={(e) => {
                              if (e.key === 'Enter') {
                                  laravel.submit().catch(() => {});
                              }
                          }}
                          onFieldsChange={laravel.onFieldsChange}>
        {children}
        {!isMobile && <div className={'flex flex-row space-x-2'}>
            {showReset && <Button type="default"
                                  onClick={() => {
                reset && reset();
                laravel.reset();
                // laravel.submit().catch(()=>{});
            }}>
                重置
            </Button>}
            <SubmitButton form={form} laravel={laravel}>
                {searchText}
            </SubmitButton>
        </div>}
    </Form>;
    return isMobile ? <div className={`flex flex-col items-stretch ${finalClassName}`}>
        <div className={'flex flex-row justify-between'}>
            <div>
                搜索
            </div>
            <div>
                <FilterOutlined className={`${touched ? 'text-sky-600' : ''}`} onClick={() => {
                    setShow(!show);
                }}/>
            </div>
        </div>
        <Modal open={show} onCancel={() => {
            laravel.reset();
            laravel.submit().catch();
            setShow(false);
        }}
               cancelText={'重置'}
               okText={'搜索'}
               onOk={() => {
                   laravel.submit().catch();
                   setShow(false);
               }}>
            {content}
        </Modal>
    </div> : content;
};
