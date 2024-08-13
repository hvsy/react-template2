import {FC, ReactNode} from "react";

export type TableHeaderProps = {
    title ?: ReactNode;
    children ?: ReactNode;
    className ?: string;
};

export const TableHeader: FC<TableHeaderProps> = (props) => {
    const {title,children,className = ''} = props;
    return (
        <div className={`mt-2 p-2 flex flex-row justify-between items-center bg-white
        md:flex-col md:gap-2 md:items-start
        ${className}`}>

            <div className={'font-bold text-lg'}>{title}</div>
            <div className="flex flex-row space-x-2 items-center md:space-x-0 md:flex-wrap md:gap-2">
                {children}
            </div>
        </div>
    );
};
