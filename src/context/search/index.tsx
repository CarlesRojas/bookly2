import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

export enum ResultsType {
    BOOK = "books",
    AUTHOR = "authors",
}

type State = {
    query: string;
    setQuery: Dispatch<SetStateAction<string>>;
    resultsType: ResultsType;
    setResultsType: Dispatch<SetStateAction<ResultsType>>;
};

type SearchProviderProps = { children: React.ReactNode };

const SearchContext = createContext<State | undefined>(undefined);

function SearchProvider({ children }: SearchProviderProps) {
    const [query, setQuery] = useState("");
    const [resultsType, setResultsType] = useState(ResultsType.BOOK);

    return (
        <SearchContext.Provider
            value={{
                query,
                setQuery,
                resultsType,
                setResultsType,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}

function useSearch() {
    const context = useContext(SearchContext);
    if (context === undefined) throw new Error("useSearch must be used within a SearchProvider");
    return context;
}

export { SearchProvider, useSearch };
