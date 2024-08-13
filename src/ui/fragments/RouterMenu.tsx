import {FC, ReactNode, useEffect, useMemo, useState} from "react";
import {Menu, MenuProps,} from "antd";
import {useLocation, useNavigate} from "react-router-dom";
import _ from "lodash";
import {ItemType} from "antd/es/menu/interface";

export type RouterMenuItem = Omit<ItemType,'key'> & {
    id?: number;
    sort?: number;
    parent_id?: number;
    url?: string;
    label ?: ReactNode | string;
    regex?: RegExp | string;
    children ?: RouterMenuItem[],
    key ?: string;
    path ?: string;
    icon ?: ReactNode,
};
export type RouterMenuProps = Omit<MenuProps, 'items'|'onClick'|'selectedKeys'> & {
    items?: RouterMenuItem[];
    onClick ?: ()=>void;
};

export const RouterMenu: FC<RouterMenuProps> = (props) => {
    const {items,onClick,...others} = props;
    const nav = useNavigate();
    const location = useLocation();
    const map = useMemo(() => {
        const after :any[]= [];
        function node(item : RouterMenuItem,key : string,paths : string[]){
            const path = [...paths,key].join('.');
            item.key = path.replaceAll('children.','');
            item.path = path;
            if(item.url){
                if(_.isString(item.label)){
                    item.label = <label>
                        <a href={item.url} className="select-none" onClick={(e) => {
                            if(!e.metaKey && !e.ctrlKey){
                                e.preventDefault();
                                const key = item.key;
                                const hit = _.get(items,item.path as string);
                                if (hit && hit.url) {
                                    nav(hit.url);
                                }
                            }
                        }}>
                            {item.label}
                        </a>
                    </label>
                }
            }

            after.push({
                key : path,
                ...item,
            });
            (item.children || []).forEach((child : any, i : any) => {
                node(child, i + '', [...paths, key!,'children']);
            })
        }
        items?.forEach((item,i)=>node(item,i + '',[]));
        return after;
    },[items]);
    const pathname = location.pathname;
    const selected = useMemo(() => {
        for(let i=0;i<map.length;++i){
            const item = map[i];
            if(item.url === pathname){
                return item.key;
            }else if(item.regex && item.regex.test(pathname)){
                return item.key;
            }
        }
        return null;
    },[pathname,map]);
    return <Menu
        onClick={(item) => {
            onClick && onClick();
        }}
        defaultOpenKeys={(selected||'').split('.')}
        items={items as ItemType[]}
        selectedKeys={selected ? [selected] : []}
        {...others}
    />

};
