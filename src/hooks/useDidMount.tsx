import { useEffect, useRef } from "react";

export default function useDidMount(callback: () => void) {
    const mounted = useRef(false);

    useEffect(() => {
        if (callback && !mounted.current) {
            mounted.current = true;
            callback();
        }
    });
}
