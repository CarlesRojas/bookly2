import { createContext, MutableRefObject, useCallback, useContext, useRef } from "react";

export enum Theme {
    DARK = "dark",
    LIGHT = "light",
    NONE = "none",
}

type State = {
    theme: MutableRefObject<Theme>;
    setTheme: (newTheme: Theme) => void;
};

type ThemeProviderProps = { children: React.ReactNode };

const ThemeContext = createContext<State | undefined>(undefined);

function ThemeProvider({ children }: ThemeProviderProps) {
    const theme = useRef(Theme.NONE);

    const setTheme = useCallback(
        (newTheme: Theme) => {
            theme.current = newTheme;
            document?.getElementById("htmlRoot")?.setAttribute("data-theme", theme.current);
        },
        [theme]
    );

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
}

export { ThemeProvider, useTheme };
