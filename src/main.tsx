import {ReactElement, StrictMode} from 'react'
import { createRoot } from 'react-dom/client'
import {App as AntdApp} from "antd";
import './index.scss'
import dayjs from "dayjs";
dayjs.locale('zh-cn')
function getRoot() {
    let root = document.getElementById('root');
    if (!root) {
        root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.appendChild(root);
    }
    return root;

}

function render(which: ReactElement) {
    createRoot(getRoot()).render(which);
}
import zhCN from 'antd/lib/locale/zh_CN';
import {SWRConfig} from "swr";
import {BrowserRouter} from "react-router-dom";
import {ConfigProvider} from "antd";
import {api} from "./lib/api.ts";
import { GlobalConfigContainer } from './containers/GlobalConfigContainer.tsx';
import {App} from "./core/App.tsx";
function main() {
    render(
        <StrictMode>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <SWRConfig value={{
                fetcher: api,
                revalidateIfStale: true,
                refreshWhenHidden: false,
                revalidateOnFocus: false,
                shouldRetryOnError: false,
                refreshWhenOffline: false,
                revalidateOnReconnect: false,
                revalidateOnMount: true,
            }}>
                <ConfigProvider locale={zhCN}>
                    <GlobalConfigContainer.Provider >
                        <AntdApp>
                            <App/>
                        </AntdApp>
                    </GlobalConfigContainer.Provider>
                </ConfigProvider>
            </SWRConfig>
        </BrowserRouter>
        </StrictMode>
    );
}

if (import.meta.env.DEV) {
    import('./mocks/browser').then((m) => {
        m.worker.start();
        main();
    });
} else {
    main();
}
