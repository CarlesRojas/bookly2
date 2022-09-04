import { createContext, useContext, useRef } from "react";

enum Event {
    REDIRECT_STARTED = "redirect-started",
    REDIRECT_ENDED = "redirect-ended",
}

type State = {
    sub: (eventName: any, func: any) => void;
    unsub: (eventName: any, func: any) => void;
    emit: (eventName: any, data?: any) => void;
};

type EventsProviderProps = { children: React.ReactNode };

const EventsContext = createContext<State | undefined>(undefined);

function EventsProvider({ children }: EventsProviderProps) {
    const events = useRef<{ [key in Event]?: ((data?: any) => void)[] }>({});

    const sub = (eventName: Event, func: (data: any) => void) => {
        events.current[eventName] = events.current[eventName] || [];
        events.current[eventName]?.push(func);
    };

    const unsub = (eventName: Event, func: (data: any) => void) => {
        const curerntEvent = events.current[eventName];
        if (curerntEvent)
            for (let i = 0; i < curerntEvent.length; i++)
                if (curerntEvent[i] === func) {
                    curerntEvent.splice(i, 1);
                    break;
                }
    };

    const emit = (eventName: Event, data: any) => {
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

export { EventsProvider, useEvents, Event };
