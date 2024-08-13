import {TreeBuilder} from "@/core/TreeBuilder";
import {Module} from "@/core/Module";

//@ts-ignore
const layouts=import.meta.glob('../root/**/config/layout.tsx');
//@ts-ignore
const pages = import.meta.glob('../root/**/pages/*.tsx');


const ModuleTreeBuilder = TreeBuilder(Module);
const pageBuilder = new ModuleTreeBuilder(/^[^/]+.tsx$/ig,/\/?pages\/|\/modules\/|\/root/i,(tree, {key,path}) => {
    if(path === 'index'){
        tree.data.index = key;
    }else{
        tree.data.pages.push({
            file : key,
            path : path.replace('%3F','?'),
        })
    }
});
const AppRootModule = pageBuilder.parse(Object.keys(pages));
const layoutBuilder = new ModuleTreeBuilder(/^layout.tsx$/ig,/\/?config\/|\/modules\/|\/root/i,(tree,{key,path})=>{
    tree.data.layout = key;
});
layoutBuilder.parse(Object.keys(layouts),AppRootModule);

export const AppModuleConfig = {
    module : AppRootModule,
    loader : {
        layout : layouts,
        page : pages,
    }
}
