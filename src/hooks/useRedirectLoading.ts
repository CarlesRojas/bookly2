import { Event, useEvents } from "@context/events";
import { useEffect, useState } from "react";
import useDidMount from "./useDidMount";

export default function useRedirectLoading() {
    const { sub, unsub, emit } = useEvents();

    const [redirectLoading, setRedirectLoading] = useState(false);

    const onRedirectStarted = () => {
        setRedirectLoading(true);
    };

    const onRedirectEnded = () => {
        setRedirectLoading(false);
    };

    useDidMount(() => {
        emit(Event.REDIRECT_ENDED);
    });

    useEffect(() => {
        sub(Event.REDIRECT_STARTED, onRedirectStarted);
        sub(Event.REDIRECT_ENDED, onRedirectEnded);

        return () => {
            unsub(Event.REDIRECT_STARTED, onRedirectStarted);
            unsub(Event.REDIRECT_ENDED, onRedirectEnded);
        };
    }, [sub, unsub]);

    return redirectLoading;
}
