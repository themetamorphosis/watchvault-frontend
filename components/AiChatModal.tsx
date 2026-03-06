"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Sparkles, Send, Loader2, CheckCircle2, Film } from "lucide-react";

export default function AiChatModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Using local state to bypass buggy input binding
    const chat = useChat({
        api: "/api/chat",
        onError: (e: any) => console.error("Chat error:", e)
    } as any) as any;

    const messages = chat.messages || [];
    const isLoading = chat.isLoading || chat.status === 'streaming' || chat.status === 'submitted' || false;
    const sendMessage = chat.append || chat.sendMessage;

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    return (
        <>
            {/* Floating Trigger Button - Minimal & Elegant */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#111] backdrop-blur-md border border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:bg-[#222] hover:border-white/20 transition-all duration-300"
            >
                <Sparkles className="h-6 w-6 text-white/80" />
            </motion.button>

            {/* Chat Modal / Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-50 bg-black/40 sm:hidden"
                        />

                        {/* Modal Panel - Minimal Glassmorphism */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(20px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(20px)" }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 30,
                                mass: 0.8
                            }}
                            className="fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col 
                                       bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-2xl border-l border-white/10 
                                       sm:bottom-6 sm:top-auto sm:right-6 sm:h-[650px] sm:w-[420px] 
                                       sm:rounded-3xl sm:border sm:border-white/10 overflow-hidden"
                            style={{ transformOrigin: "bottom right" }}
                        >
                            {/* Header */}
                            <div className="relative flex items-center justify-between border-b border-white/[0.05] p-5 pb-4 bg-transparent">
                                <div className="relative flex items-center gap-3">
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-white/80 border border-white/10 shadow-inner">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white/90 tracking-wide text-sm">Vault Assistant</h3>
                                        <p className="text-[10px] text-white/40 tracking-wider flex items-center gap-1.5 mt-0.5">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/60"></span>
                                            </span>
                                            Active
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="relative rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition-all duration-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {messages.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex flex-col items-center justify-center h-full text-center"
                                    >
                                        <div className="space-y-2 mb-8 mt-auto">
                                            <p className="text-white/80 font-medium">How can I assist you today?</p>
                                            <p className="text-xs text-white/40 max-w-[250px] leading-relaxed mx-auto">I can recommend movies, semantic search by vibe, or automatically add items to your library.</p>
                                        </div>

                                        {/* Suggestions */}
                                        <div className="flex flex-col gap-2.5 w-full max-w-[320px] mt-auto pb-4">
                                            {[
                                                "Add Inception to my library",
                                                "Suggest a relaxing sci-fi movie",
                                                "What should I watch based on my list?",
                                                "A movie about dreams inside dreams"
                                            ].map((suggestion, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        sendMessage({ role: "user", content: suggestion });
                                                    }}
                                                    className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200 text-sm text-white/60 hover:text-white/90 flex items-center gap-3 group"
                                                >
                                                    <Sparkles className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors" />
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <AnimatePresence initial={false}>
                                    {messages.map((m: any) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, scale: 0.9, originY: 1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`max-w-[85%] rounded-[20px] px-5 py-3.5 text-[14px] leading-relaxed shadow-sm ${m.role === "user"
                                                ? "bg-white/[0.08] text-white border border-white/[0.05] rounded-br-[6px]"
                                                : "bg-[#111111]/60 backdrop-blur-md text-white/90 rounded-bl-[6px] border border-white/[0.03]"}`}
                                            >

                                                {/* Normal Text Content */}
                                                {(m as any).content && <div className="whitespace-pre-wrap">{(m as any).content}</div>}

                                                {/* Tool Invocations UI */}
                                                {(m as any).toolInvocations?.map((toolInvocation: any, i: number) => {
                                                    const toolCallId = toolInvocation.toolCallId;
                                                    const toolName = toolInvocation.toolName;
                                                    const args = toolInvocation.args;

                                                    if (toolName === "searchMedia") {
                                                        return (
                                                            <div key={toolCallId} className="mt-3 flex items-center gap-3 text-xs text-white/60 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.05] backdrop-blur-sm">
                                                                {'result' in toolInvocation ? (
                                                                    <div className="h-5 w-5 rounded-full bg-white/[0.05] flex items-center justify-center">
                                                                        <CheckCircle2 className="h-3 w-3 text-white/80" />
                                                                    </div>
                                                                ) : (
                                                                    <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                                                                )}
                                                                <span className="font-medium tracking-wide">Searching database for "{args.query}"...</span>
                                                            </div>
                                                        )
                                                    }

                                                    if (toolName === "addToLibrary") {
                                                        const isDone = 'result' in toolInvocation;
                                                        const success = isDone ? toolInvocation.result?.success : false;
                                                        return (
                                                            <motion.div
                                                                layout
                                                                key={toolCallId}
                                                                className="mt-3 overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] shadow-inner"
                                                            >
                                                                <div className="p-4 flex flex-col gap-2 relative">
                                                                    {isDone && success && (
                                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                                                    )}
                                                                    <div className="flex items-start gap-3 relative z-10">
                                                                        <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center ${isDone ? (success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400') : 'bg-white/5 text-white/60'}`}>
                                                                            <Film className="h-4 w-4" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-sm font-semibold text-white/90">{args.title} {args.year ? <span className="text-white/40 font-normal">({args.year})</span> : ""}</h4>
                                                                            <div className="mt-1 flex items-center gap-1.5 text-xs">
                                                                                {isDone ? (
                                                                                    success ? (
                                                                                        <>
                                                                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                                                                            <span className="text-emerald-400/90 font-medium">Successfully added</span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <X className="h-3.5 w-3.5 text-red-400" />
                                                                                            <span className="text-red-400/90 font-medium">Failed to add</span>
                                                                                        </>
                                                                                    )
                                                                                ) : (
                                                                                    <>
                                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white/50" />
                                                                                        <span className="text-white/40">Processing request...</span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )
                                                    }

                                                    return null;
                                                })}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {isLoading && messages[messages.length - 1]?.role === "user" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, originY: 1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-[#111111]/80 backdrop-blur-md rounded-[20px] rounded-bl-[6px] border border-white/[0.03] px-5 py-4 flex gap-1.5 items-center shadow-sm">
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="h-1.5 w-1.5 bg-white/60 rounded-full" />
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }} className="h-1.5 w-1.5 bg-white/60 rounded-full" />
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }} className="h-1.5 w-1.5 bg-white/60 rounded-full" />
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} className="h-1" />
                            </div>

                            {/* Input Form */}
                            <div className="p-5 pt-2 bg-gradient-to-t from-black via-[#0a0a0a]/90 to-transparent relative z-10">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!chatInput.trim()) return;

                                    sendMessage({ role: "user", content: chatInput });
                                    setChatInput("");
                                }} className="relative flex items-center group">
                                    <input
                                        name="message"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Ask Assistant..."
                                        disabled={isLoading}
                                        className="w-full relative z-10 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl pl-5 pr-14 py-3.5 text-[15px] text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/[0.08] transition-all disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || isLoading}
                                        className="absolute right-1.5 z-20 p-2.5 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/50 transition-all duration-200"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>
                                <div className="text-center mt-3">
                                    <p className="text-[10px] text-white/30 font-medium tracking-wide">AI Assistant may produce inaccurate information.</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
