import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path";
import _ from "lodash";
// https://vitejs.dev/config/
export default defineConfig(({command,mode}) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy_api = env.VITE_API || `${_.trimEnd(env.VITE_BASE,'/')}/api/`
  console.log('proxy_api:',proxy_api);
  return {
    base : env.VITE_BASE,
    server : {
      proxy : {
         [proxy_api]: {
          'target' : {
            'host' : '0.0.0.0',
            port : env.VITE_API_PORT || '80',
            protocol : 'http',
          },
          // changeOrigin : true,
          configure(proxy){
            const old = proxy.web;
            proxy.web = (req,res,options,callback) => {
              const target = `http://${req.headers.host!.replace(/:\d+/,':'+(env.VITE_API_PORT || '80'))}`;
              console.log('proxy target:',target);
              const opts = {
                ...options,
                target,
              };
              return old.call(proxy,req,res,opts,callback);
            };
          }
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@root": path.resolve(__dirname, "./src/root"),
        "@ui" : path.resolve(__dirname, "./src/ui"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@utils": path.resolve(__dirname, "./src/utils"),
      },
    },
  };
})
