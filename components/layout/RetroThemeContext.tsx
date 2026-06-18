"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeType = "retro-dark" | "retro-light" | "modern-dark" | "modern-light";

interface RetroThemeContextType {
    scanlines: boolean;
    setScanlines: (val: boolean) => void;
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
}

const RetroThemeContext = createContext<RetroThemeContextType | undefined>(undefined);

export function RetroThemeProvider({ children }: { children: React.ReactNode }) {
    const [scanlines, setScanlines] = useState<boolean>(true);
    const [theme, setTheme] = useState<ThemeType>("modern-dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedScanlines = localStorage.getItem("wv-global-scanlines");
        if (savedScanlines !== null) {
            setScanlines(savedScanlines === "true");
        }
        const savedTheme = localStorage.getItem("wv-global-theme");
        if (savedTheme === "dark") {
            setTheme("retro-dark");
        } else if (savedTheme === "light") {
            setTheme("retro-light");
        } else if (
            savedTheme === "retro-dark" || 
            savedTheme === "retro-light" || 
            savedTheme === "modern-dark" || 
            savedTheme === "modern-light"
        ) {
            setTheme(savedTheme as ThemeType);
        } else {
            setTheme("modern-dark");
        }
    }, []);

    const handleSetScanlines = (val: boolean) => {
        setScanlines(val);
        try {
            localStorage.setItem("wv-global-scanlines", String(val));
        } catch {}
    };

    const handleSetTheme = (newTheme: ThemeType) => {
        setTheme(newTheme);
        try {
            localStorage.setItem("wv-global-theme", newTheme);
        } catch {}
    };

    const toggleTheme = () => {
        let nextTheme: ThemeType = "modern-dark";
        if (theme === "modern-dark") nextTheme = "modern-light";
        else if (theme === "modern-light") nextTheme = "modern-dark";
        else if (theme === "retro-dark") nextTheme = "retro-light";
        else if (theme === "retro-light") nextTheme = "retro-dark";
        
        handleSetTheme(nextTheme);
    };

    return (
        <RetroThemeContext.Provider 
            value={{ 
                scanlines: mounted ? scanlines : true, 
                setScanlines: handleSetScanlines,
                theme: mounted ? theme : "modern-dark",
                setTheme: handleSetTheme,
                toggleTheme
            }}
        >
            {children}
        </RetroThemeContext.Provider>
    );
}

export function useRetroTheme() {
    const context = useContext(RetroThemeContext);
    if (!context) {
        throw new Error("useRetroTheme must be used within a RetroThemeProvider");
    }
    return context;
}

