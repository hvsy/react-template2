import {useCallback, useRef} from "react";

export function useOkAndCancel(options: {
    submit?: Function,
    afterSubmit?: Function,
    cancel?: Function,
    afterCancel ?: Function,
    autoClose ?: boolean;
    after ?: Function;
}) {
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const ok = useCallback(async(e ?: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e?.preventDefault();
        e?.stopPropagation();
        const {submit,after, afterSubmit,autoClose,cancel,} = optionsRef.current;
        if (!submit) return;
        try {
            await submit();
            afterSubmit?.();
            if (autoClose === undefined || autoClose) {
                cancel?.();
            }
            after?.();
        } catch (e) {
            //
        }
    }, []);
    const cancel = useCallback((e ?: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e?.preventDefault();
        e?.stopPropagation();
        const {after,cancel,afterCancel} = optionsRef.current;
        cancel && cancel();
        afterCancel && afterCancel();
        after?.();
    },[]);
    return [ok,cancel] as const;
}
