import { createFromIconfontCN } from '@ant-design/icons';
import {FC} from "react";
import {IconFontProps} from "@ant-design/icons/es/components/IconFont";

export const MyIcon :FC<IconFontProps<string>> = createFromIconfontCN({
    scriptUrl: import.meta.env.VITE_ICON_URL || '',
});
