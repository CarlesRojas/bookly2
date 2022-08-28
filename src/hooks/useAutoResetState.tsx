import { useEffect, useState } from 'react';

export default function useAutoResetState(initialValue: any, duration: number) {
    const [internalState, setInternalState] = useState(initialValue);

    useEffect(() => {
        let timeout: NodeJS.Timeout | null = null;
        if (internalState !== initialValue) timeout = setTimeout(() => setInternalState(initialValue), duration);

        return () => {
            timeout && clearTimeout(timeout);
        };
    }, [duration, initialValue, internalState]);

    return [internalState, setInternalState];
}
