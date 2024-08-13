import { FC } from "react";
import {useLaravelForm} from "@/hooks/useLaravelForm";
import { api } from "@/lib/api";
import {App, Button, Form,} from "antd";
import {PasswordInput} from "@/ui/form/PasswordInput";
import { CustomValidator } from "@/ui/components/FormValidators";
import {AsyncButton} from "@/ui/form/AsyncButton";
import {useGlobalConfig} from "@/containers/GlobalConfigContainer";
import {useUser} from "@/containers/AuthContainer.tsx";

export type ChangePasswordFormProps = {
    path ?: string;
}

export const ChangePasswordForm : FC<ChangePasswordFormProps> = (props) => {
    const {isMobile} = useGlobalConfig();
    const {path = 'change-password'} = props;
    const app = App.useApp();
    const [user,refresh] = useUser();
    const [form,laravel] = useLaravelForm(async (values) => {
        const res = await api({
            method : 'put',
            url : path || '/change-password',
            data : values,
        });
        if(res === true){
            laravel.reset();
            app.notification.success({
                type : 'success',
                message : '修改密码成功,请重新登录',
            });
            refresh().catch();
        }
        return res;
    });
    return <Form component={false} size={'large'} form={form}
                 layout={isMobile ? 'vertical' :'horizontal'}
                 onFieldsChange={laravel.onFieldsChange}
                 labelCol={{
                     sm: {
                         span:5,
                     },
                     xs: {
                         span:24,
                     }
                 }}
                 wrapperCol={{
                     sm : {
                        span:12
                     },
                     xs: {
                         span:24,
                     }
                 }}
    >
        <Form.Item label={'原始密码'} {...laravel.field('old_password')} rules={[{
            required : true,
            message : '请输入原始密码'
        }]}>
            <PasswordInput />
        </Form.Item>
        <Form.Item label={'新密码'} {...laravel.field('password')}
                   rules={[
                       {
                           required : true,
                           message : '请输入新密码',
                       }
                   ]}
        >
            <PasswordInput />
        </Form.Item>
        <Form.Item label={'确认新密码'} {...laravel.field('password_confirmation')}
                   dependencies={['password']}
                   rules={[{
                       required : true,
                       message : '请再次输入新密码',
                   },CustomValidator.confirmed('password','两次密码不一致')]}
        >
            <PasswordInput />
        </Form.Item>
        <div className={'flex flex-row justify-end space-x-2'}>
            <Button onClick={laravel.reset}>
                重置
            </Button>
            <AsyncButton onClick={laravel.submit}
                         type="primary"
                         className=""
                         loading={laravel.submitting}
            >
                修改密码
            </AsyncButton>
        </div>
    </Form>
};
