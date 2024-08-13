import {RouterMenuItem} from "@ui/fragments/RouterMenu.tsx";
import {HomeOutlined} from "@ant-design/icons";
import {MyIcon} from "@ui/MyIcon.tsx";

export default (user : User,can : (...names : string[])=>boolean) : RouterMenuItem[]  =>  {
    return [
        {
            url : '/',
            label : '首页',
            icon : <HomeOutlined />
        },
    ]
}
