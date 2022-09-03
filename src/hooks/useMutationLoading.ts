import { Events, useEvents } from "@context/events";
import { useEffect, useRef } from "react";

export default function useMutationLoading(isLoading: boolean) {
    const { emit } = useEvents();

    const lastValue = useRef(false);

    useEffect(() => {
        if (isLoading === lastValue.current) return;
        lastValue.current = isLoading;

        emit(isLoading ? Events.MUTATION_LOADING : Events.MUTATION_DONE, {});
    }, [emit, isLoading]);
}
