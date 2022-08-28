import { useCallback, useEffect, useRef } from "react";

export default function useWheel(callback: (e: WheelEvent) => void) {
    const timer = useRef<NodeJS.Timeout | null>(null);

    const onWheel = useCallback(
        (event: WheelEvent) => {
            if (!timer.current) {
                callback(event);

                timer.current = setTimeout(() => {
                    timer.current = null;
                }, 500);
            }
        },
        [callback]
    );

    useEffect(() => {
        window.addEventListener("wheel", onWheel);

        return () => {
            window.removeEventListener("wheel", onWheel);
        };
    }, [onWheel]);
}
