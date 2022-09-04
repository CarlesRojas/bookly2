import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

export enum SortBy {
    TITLE = "title",
    AUTHOR = "author",
    RATING = "rating",
    YEAR = "year",
}

type State = {
    sortedBy: SortBy;
    setSortedBy: Dispatch<SetStateAction<SortBy>>;
    descending: boolean;
    setDescending: Dispatch<SetStateAction<boolean>>;
    viewGrouped: boolean;
    setViewGrouped: Dispatch<SetStateAction<boolean>>;
};

type SortProviderProps = { children: React.ReactNode };

const SortContext = createContext<State | undefined>(undefined);

function SortProvider({ children }: SortProviderProps) {
    const [sortedBy, setSortedBy] = useState(SortBy.YEAR);
    const [descending, setDescending] = useState(true);
    const [viewGrouped, setViewGrouped] = useState(true);

    return (
        <SortContext.Provider
            value={{
                sortedBy,
                setSortedBy,
                descending,
                setDescending,
                viewGrouped,
                setViewGrouped,
            }}
        >
            {children}
        </SortContext.Provider>
    );
}

function useSort() {
    const context = useContext(SortContext);
    if (context === undefined) throw new Error("useSort must be used within a SortProvider");
    return context;
}

export { SortProvider, useSort };
