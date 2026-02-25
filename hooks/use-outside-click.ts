import { useEffect, RefObject } from "react";

export function useOutsideClick(
    ref: RefObject<HTMLElement | null>,
    callback: () => void
) {
    useEffect(() => {
        function handler(e: MouseEvent | TouchEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, [ref, callback]);
}
