"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SelectOption<T extends string> = { value: T; label: string };

export function GlassSelect<T extends string>({
    value,
    onChange,
    options,
    className = "",
    buttonClassName = "",
    align = "left",
    minWidth = 140,
    buttonLabelPrefix,
    menuClassName = "",
}: {
    value: T;
    onChange: (v: T) => void;
    options: SelectOption<T>[];
    className?: string;
    buttonClassName?: string;
    align?: "left" | "right";
    minWidth?: number | string;
    buttonLabelPrefix?: string;
    menuClassName?: string;
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        function onMouse(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onMouse);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onMouse);
        };
    }, []);

    const current = options.find((o) => o.value === value)?.label ?? value;
    const buttonText = buttonLabelPrefix ? `${buttonLabelPrefix}: ${current}` : current;

    return (
        <div ref={containerRef} className={"relative inline-block " + className}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`liquid-glass liquid-glass-round liquid-glass-hover liquid-glass-press flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium tracking-tight text-white/80 transition ${buttonClassName}`}
                style={{ minWidth }}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="truncate">{buttonText}</span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/50 text-xs flex-shrink-0"
                >
                    ▾
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        role="listbox"
                        className={[
                            "absolute z-50 mt-2 w-full min-w-max overflow-hidden rounded-xl",
                            "bg-black/70 backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl",
                            align === "right" ? "right-0" : "left-0",
                            menuClassName
                        ].join(" ")}
                    >
                        {options.map((opt) => {
                            const active = opt.value === value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="option"
                                    aria-selected={active}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                    className={[
                                        "w-full text-left px-3 py-2.5 text-sm font-medium tracking-tight",
                                        "transition-all duration-200",
                                        active ? "bg-white/[0.12] text-white" : "text-white/70",
                                        "hover:bg-white/[0.08] hover:text-white",
                                    ].join(" ")}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
