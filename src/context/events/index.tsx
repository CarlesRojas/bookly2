import { createContext, useContext, useRef } from "react";

interface Subscription {
    [key: string]: ((data?: any) => void)[];
}

type State = {
    sub: (eventName: any, func: any) => void;
    unsub: (eventName: any, func: any) => void;
    emit: (eventName: any, data: any) => void;
};

type EventsProviderProps = { children: React.ReactNode };

const EventsContext = createContext<State | undefined>(undefined);

function EventsProvider({ children }: EventsProviderProps) {
    const events = useRef<Subscription>({});

    const sub = (eventName: string, func: (data: any) => void) => {
        events.current[eventName] = events.current[eventName] || [];
        events.current[eventName]?.push(func);
    };

    const unsub = (eventName: string, func: (data: any) => void) => {
        const curerntEvent = events.current[eventName];
        if (curerntEvent)
            for (let i = 0; i < curerntEvent.length; i++)
                if (curerntEvent[i] === func) {
                    curerntEvent.splice(i, 1);
                    break;
                }
    };

    const emit = (eventName: string, data: any) => {
        const curerntEvent = events.current[eventName];
        console.log(`Event fired: ${eventName}`);
        if (curerntEvent)
            curerntEvent.forEach(function (func) {
                func(data);
            });
    };

    return <EventsContext.Provider value={{ sub, unsub, emit }}>{children}</EventsContext.Provider>;
}

function useEvents() {
    const context = useContext(EventsContext);
    if (context === undefined) throw new Error("useEvents must be used within an EventsProvider");
    return context;
}

enum Events {
    MUTATION_LOADING = "mutationLoading",
    MUTATION_DONE = "mutationDone",
}

export { EventsProvider, useEvents, Events };
