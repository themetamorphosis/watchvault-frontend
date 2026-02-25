"use client";

import React from "react";
import { motion } from "framer-motion";

const pageVariants = {
    initial: {
        opacity: 0,
        y: 12,
        filter: "blur(6px)",
    },
    enter: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
    },
    exit: {
        opacity: 0,
        y: -8,
        filter: "blur(4px)",
    },
};

const pageTransition = {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
        >
            {children}
        </motion.div>
    );
}
