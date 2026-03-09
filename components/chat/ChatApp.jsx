"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  SendIcon,
  LoaderIcon,
  Paperclip,
  XIcon,
  MessageSquare,
  Search,
  Trash2,
  ChevronRight,
  Sparkles,
  Wind,
  BookOpen,
  Heart,
  Menu,
  X,
  MoreHorizontal,
  Settings,
} from "lucide-react";

/* ─── Auto-resize textarea hook ─────────────────────────── */
function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);
  const adjustHeight = useCallback(
    (reset) => {
      const el = textareaRef.current;
      if (!el) return;
      if (reset) { el.style.height = `${minHeight}px`; return; }
      el.style.height = `${minHeight}px`;
      el.style.height = `${Math.min(el.scrollHeight, maxHeight ?? Infinity)}px`;
    },
    [minHeight, maxHeight]
  );
  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);
  return { textareaRef, adjustHeight };
}

/* ─── Typing dots ────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-amber-500"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Suggestion chips (Calmio-specific) ──────────────────── */
const SUGGESTIONS = [
  { icon: <Heart className="w-3.5 h-3.5" />, label: "How I'm feeling", text: "I'd like to talk about how I'm feeling today." },
  { icon: <BookOpen className="w-3.5 h-3.5" />, label: "Daily reflection", text: "Help me with a daily reflection." },
  { icon: <Wind className="w-3.5 h-3.5" />, label: "Breathing exercise", text: "Guide me through a breathing exercise." },
  { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Track my mood", text: "I want to track my mood today." },
];

/* ─── Mock chat history ───────────────────────────────────── */
const HISTORY = [
  { id: 1, title: "Morning anxiety check-in", time: "Today" },
  { id: 2, title: "Breathing techniques", time: "Today" },
  { id: 3, title: "Work stress reflections", time: "Yesterday" },
  { id: 4, title: "Sleep quality journal", time: "Yesterday" },
  { id: 5, title: "Gratitude practice", time: "Mon" },
];

/* ─── Main ChatApp ───────────────────────────────────────── */
export default function ChatApp() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [attachments, setAttachments] = useState([]);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 200,
  });

  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg = { id: Date.now(), role: "user", text: inputValue.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    adjustHeight(true);
    setIsThinking(true);
    startTransition(() => {
      setTimeout(() => {
        setIsThinking(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "ai",
            text: "I hear you. Take a breath — I'm here with you. Would you like to explore this feeling a little more, or would a short grounding exercise help right now?",
          },
        ]);
      }, 2200);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text) => {
    setInputValue(text);
    textareaRef.current?.focus();
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveChat(null);
    setSidebarOpen(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <div
      data-page="chat-home"
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: '"Sora", system-ui, -apple-system, sans-serif',
        background: "linear-gradient(145deg, #fffbeb, #fef3c7)",
        color: "#0f172a",
      }}
    >
      {/* ── Ambient background orbs ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "5%", left: "10%",
          width: 480, height: 480,
          background: "radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)",
          filter: "blur(60px)", borderRadius: "50%",
          animation: "floatOrb 14s ease-in-out infinite alternate",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "8%",
          width: 360, height: 360,
          background: "radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 70%)",
          filter: "blur(60px)", borderRadius: "50%",
          animation: "floatOrb 18s ease-in-out infinite alternate-reverse",
        }} />
      </div>

      {/* ── Mouse-follow glow when input focused ── */}
      {inputFocused && (
        <motion.div
          style={{
            position: "fixed", width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)",
            filter: "blur(80px)", pointerEvents: "none", zIndex: 1,
            translateX: "-50%", translateY: "-50%",
          }}
          animate={{ left: mousePos.x, top: mousePos.y }}
          transition={{ type: "spring", damping: 30, stiffness: 100, mass: 0.5 }}
        />
      )}

      {/* ── Header / Nav ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        backdropFilter: "blur(20px)",
        background: "rgba(255,251,235,0.85)",
        borderBottom: "1px solid rgba(202,138,4,0.15)",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", height: 57,
        }}>
          {/* Left: sidebar toggle + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              style={{
                width: 34, height: 34, borderRadius: 10,
                border: "1px solid rgba(202,138,4,0.25)",
                background: "rgba(254,243,199,0.7)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#92400e", transition: "all 150ms",
              }}
            >
              {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
            <a href="/" style={{
              display: "flex", alignItems: "center", gap: 9,
              textDecoration: "none",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, #fef9c3, #ca8a04 55%, #b45309)",
                boxShadow: "0 4px 12px rgba(202,138,4,0.4)",
              }} />
              <span style={{
                fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.06em",
                textTransform: "uppercase", color: "#0f172a",
              }}>Calmio</span>
            </a>
          </div>

          {/* Right: nav links + CTA */}
          <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a href="/about" style={{ fontSize: "0.86rem", color: "#64748b", textDecoration: "none" }}>About</a>
            <a href="/contact" style={{ fontSize: "0.86rem", color: "#64748b", textDecoration: "none" }}>Contact</a>
            <a href="/login" style={{
              fontSize: "0.86rem", fontWeight: 500, color: "#0f172a",
              padding: "7px 18px", borderRadius: 999,
              border: "1.5px solid rgba(15,23,42,0.18)", textDecoration: "none",
              transition: "all 150ms",
            }}>Log in</a>
          </nav>
        </div>
      </header>

      {/* ── App body ── */}
      <div style={{
        display: "flex", flex: 1, minHeight: 0, position: "relative", zIndex: 2,
        overflow: "hidden",
      }}>
        {/* ── Sidebar backdrop (mobile) ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed", inset: 0, background: "rgba(15,23,42,0.25)",
                backdropFilter: "blur(2px)", zIndex: 48,
              }}
            />
          )}
        </AnimatePresence>

        {/* ── Sidebar ── */}
        <motion.aside
          animate={{ x: sidebarOpen ? 0 : -280 }}
          initial={{ x: -280 }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
          style={{
            position: "fixed", top: 57, left: 0, bottom: 0, width: 260,
            zIndex: 49, display: "flex", flexDirection: "column",
            background: "rgba(255,251,235,0.97)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(202,138,4,0.15)",
            boxShadow: "4px 0 30px rgba(15,23,42,0.08)",
          }}
        >
          {/* New chat */}
          <div style={{ padding: "14px 12px 8px" }}>
            <button
              onClick={startNewChat}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "10px 14px", borderRadius: 14,
                background: "linear-gradient(135deg, #eab308, #ca8a04)",
                border: "none", color: "white",
                fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 500,
                cursor: "pointer", boxShadow: "0 8px 20px rgba(202,138,4,0.3)",
                transition: "all 200ms",
              }}
            >
              <PlusIcon size={15} />
              New conversation
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: "0 12px 8px", position: "relative" }}>
            <Search size={13} style={{
              position: "absolute", left: 22, top: "50%", transform: "translateY(-50%)",
              color: "#94a3b8", pointerEvents: "none",
            }} />
            <input
              placeholder="Search..."
              style={{
                width: "100%", padding: "8px 10px 8px 32px",
                borderRadius: 10, border: "1px solid rgba(202,138,4,0.2)",
                background: "rgba(255,255,255,0.7)",
                fontFamily: "inherit", fontSize: "0.82rem", color: "#0f172a",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* History */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "0 8px 12px",
          }}>
            <p style={{
              padding: "8px 14px 4px",
              fontSize: "0.7rem", textTransform: "uppercase",
              letterSpacing: "0.12em", color: "#94a3b8", fontWeight: 500,
            }}>Recent</p>
            {HISTORY.map((item, i) => (
              <motion.button
                key={item.id}
                onClick={() => { setActiveChat(item.id); setSidebarOpen(false); }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  width: "100%", padding: "8px 10px",
                  borderRadius: 12, border: `1px solid ${activeChat === item.id ? "rgba(202,138,4,0.3)" : "transparent"}`,
                  background: activeChat === item.id ? "rgba(254,243,199,0.9)" : "transparent",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  transition: "all 150ms",
                  boxShadow: activeChat === item.id ? "0 4px 14px rgba(202,138,4,0.1)" : "none",
                  marginBottom: 2,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: "linear-gradient(135deg, #fef9c3, #fde68a)",
                  border: "1px solid rgba(253,230,138,0.8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#ca8a04",
                }}>
                  <MessageSquare size={13} />
                </div>
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <p style={{
                    fontSize: "0.82rem", fontWeight: 500, color: "#0f172a",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0,
                  }}>{item.title}</p>
                  <p style={{ fontSize: "0.7rem", color: "#94a3b8", margin: 0 }}>{item.time}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Sidebar footer */}
          <div style={{
            padding: "12px 14px",
            borderTop: "1px solid rgba(202,138,4,0.12)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 12, cursor: "pointer",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "radial-gradient(circle at 25% 25%, #fef9c3, #ca8a04 50%, #b45309)",
                boxShadow: "0 0 0 2px rgba(253,230,138,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "0.75rem", fontWeight: 600, flexShrink: 0,
              }}>A</div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 600, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Alex Rivera</p>
                <p style={{ fontSize: "0.7rem", color: "#94a3b8", margin: 0 }}>Free plan</p>
              </div>
              <Settings size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
            </div>
          </div>
        </motion.aside>

        {/* ── Main chat area ── */}
        <main style={{
          flex: 1, display: "flex", flexDirection: "column",
          overflow: "hidden", minHeight: 0, position: "relative",
        }}>
          {/* Top bar (visible when chatting) */}
          <AnimatePresence>
            {hasMessages && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{
                  padding: "12px 20px", flexShrink: 0,
                  borderBottom: "1px solid rgba(202,138,4,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(255,251,235,0.75)", backdropFilter: "blur(16px)",
                }}
              >
                <p style={{ fontSize: "0.88rem", fontWeight: 500, margin: 0 }}>
                  {activeChat ? HISTORY.find(h => h.id === activeChat)?.title : "New conversation"}
                </p>
                <button style={{
                  width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(202,138,4,0.2)",
                  background: "rgba(255,255,255,0.6)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8",
                }}>
                  <MoreHorizontal size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages / Welcome */}
          <div style={{
            flex: 1, overflowY: "auto", minHeight: 0,
            display: "flex", flexDirection: "column",
            padding: hasMessages ? "24px 0 16px" : 0,
            scrollbarWidth: "thin", scrollbarColor: "rgba(202,138,4,0.2) transparent",
          }}>
            {!hasMessages ? (
              /* ─── Welcome screen (21st.dev style) ─── */
              <motion.div
                initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "40px 24px 0", textAlign: "center",
                }}
              >
                {/* Animated orb */}
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 10px rgba(253,230,138,0.22), 0 0 0 20px rgba(253,230,138,0.08), 0 20px 50px rgba(202,138,4,0.4)",
                      "0 0 0 14px rgba(253,230,138,0.16), 0 0 0 28px rgba(253,230,138,0.06), 0 24px 60px rgba(202,138,4,0.55)",
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "radial-gradient(circle at 30% 25%, #fef9c3, #ca8a04 50%, #b45309)",
                    marginBottom: 28,
                  }}
                />

                {/* Title with animated underline */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  style={{ marginBottom: 10 }}
                >
                  <h1 style={{
                    fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
                    fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 6px",
                    background: "linear-gradient(135deg, #92400e 0%, #ca8a04 50%, #b45309 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    How are you feeling today?
                  </h1>
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ delay: 0.55, duration: 0.9 }}
                    style={{
                      height: 1,
                      background: "linear-gradient(90deg, transparent, rgba(202,138,4,0.3), transparent)",
                    }}
                  />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  style={{ fontSize: "0.95rem", color: "#78716c", maxWidth: 360, margin: "0 0 36px", lineHeight: 1.6 }}
                >
                  Share what's on your mind — I'm here to listen and help you reflect.
                </motion.p>

                {/* Suggestion chips */}
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 10,
                  justifyContent: "center", maxWidth: 520,
                }}>
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s.label}
                      onClick={() => handleSuggestion(s.text)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "9px 16px", borderRadius: 12,
                        background: "rgba(255,255,255,0.75)",
                        border: "1px solid rgba(202,138,4,0.2)",
                        color: "#78350f", fontSize: "0.83rem", fontWeight: 500,
                        cursor: "pointer", fontFamily: "inherit",
                        boxShadow: "0 2px 8px rgba(202,138,4,0.06)",
                        transition: "background 200ms, border-color 200ms",
                        position: "relative", overflow: "hidden",
                      }}
                    >
                      <span style={{ color: "#ca8a04" }}>{s.icon}</span>
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* ─── Message bubbles ─── */
              <div style={{
                width: "min(820px, 100%)", marginInline: "auto",
                paddingInline: 20, display: "flex", flexDirection: "column", gap: 8,
              }}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      display: "flex", gap: 12,
                      flexDirection: msg.role === "user" ? "row-reverse" : "row",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: msg.role === "ai"
                        ? "radial-gradient(circle at 28% 28%, #fef9c3, #ca8a04 50%, #b45309)"
                        : "linear-gradient(135deg, #0f172a, #1e293b)",
                      boxShadow: msg.role === "ai" ? "0 0 0 3px rgba(253,230,138,0.4)" : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: "0.7rem", fontWeight: 600,
                    }}>
                      {msg.role === "ai" ? "C" : "A"}
                    </div>

                    {/* Bubble */}
                    <div style={{
                      maxWidth: "76%", padding: "12px 16px", fontSize: "0.9rem",
                      lineHeight: 1.6,
                      ...(msg.role === "ai" ? {
                        background: "rgba(255,255,255,0.92)",
                        border: "1px solid rgba(202,138,4,0.15)",
                        boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
                        borderRadius: "4px 18px 18px 18px",
                      } : {
                        background: "linear-gradient(135deg, #eab308, #ca8a04)",
                        color: "white",
                        borderRadius: "18px 4px 18px 18px",
                        boxShadow: "0 8px 24px rgba(202,138,4,0.3)",
                      }),
                    }}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Thinking indicator */}
                <AnimatePresence>
                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "radial-gradient(circle at 28% 28%, #fef9c3, #ca8a04 50%, #b45309)",
                        boxShadow: "0 0 0 3px rgba(253,230,138,0.4)",
                        flexShrink: 0,
                      }} />
                      <div style={{
                        padding: "14px 18px", borderRadius: "4px 18px 18px 18px",
                        background: "rgba(255,255,255,0.92)",
                        border: "1px solid rgba(202,138,4,0.15)",
                        display: "flex", alignItems: "center", gap: 6,
                        fontSize: "0.85rem", color: "#78716c",
                      }}>
                        Thinking <TypingDots />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Input area (21st.dev style) ── */}
          <div style={{
            padding: "12px 20px 20px", flexShrink: 0, background: "transparent",
          }}>
            <div style={{ width: "min(720px, 100%)", marginInline: "auto" }}>
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                style={{
                  position: "relative",
                  backdropFilter: "blur(20px)",
                  background: "rgba(255,255,255,0.92)",
                  borderRadius: 20,
                  border: inputFocused
                    ? "1px solid rgba(202,138,4,0.45)"
                    : "1px solid rgba(202,138,4,0.2)",
                  boxShadow: inputFocused
                    ? "0 0 0 3px rgba(253,230,138,0.35), 0 16px 40px rgba(202,138,4,0.12)"
                    : "0 16px 40px rgba(15,23,42,0.08)",
                  transition: "border-color 200ms, box-shadow 200ms",
                }}
              >
                {/* Attachments */}
                <AnimatePresence>
                  {attachments.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      style={{ padding: "10px 16px 0", display: "flex", gap: 8, flexWrap: "wrap" }}
                    >
                      {attachments.map((file, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "4px 10px", borderRadius: 8,
                            background: "rgba(254,243,199,0.8)",
                            border: "1px solid rgba(253,230,138,0.6)",
                            fontSize: "0.78rem", color: "#78350f",
                          }}
                        >
                          {file}
                          <button onClick={() => setAttachments(p => p.filter((_, i) => i !== idx))}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ca8a04", padding: 0, display: "flex" }}>
                            <XIcon size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Textarea */}
                <div style={{ padding: "14px 16px 4px" }}>
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); adjustHeight(); }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Share what's on your mind…"
                    style={{
                      width: "100%", border: "none", background: "transparent",
                      outline: "none", resize: "none", overflow: "hidden",
                      fontFamily: "inherit", fontSize: "0.9rem", color: "#0f172a",
                      lineHeight: 1.55, minHeight: 52,
                      caretColor: "#ca8a04",
                    }}
                  />
                </div>

                {/* Bottom action row */}
                <div style={{
                  padding: "8px 12px 12px",
                  borderTop: "1px solid rgba(202,138,4,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                }}>
                  {/* Left actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setAttachments(p => [...p, `file-${Math.floor(Math.random()*100)}.pdf`])}
                      style={{
                        width: 34, height: 34, borderRadius: 10,
                        border: "none", background: "transparent",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#94a3b8", transition: "color 150ms, background 150ms",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(202,138,4,0.07)"; e.currentTarget.style.color = "#ca8a04"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                    >
                      <Paperclip size={15} />
                    </motion.button>
                  </div>

                  {/* Send button */}
                  <motion.button
                    onClick={handleSend}
                    disabled={isThinking || !inputValue.trim()}
                    whileHover={inputValue.trim() ? { scale: 1.03 } : {}}
                    whileTap={inputValue.trim() ? { scale: 0.96 } : {}}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "8px 18px", borderRadius: 12, border: "none",
                      fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 500,
                      cursor: inputValue.trim() && !isThinking ? "pointer" : "not-allowed",
                      transition: "all 200ms",
                      ...(inputValue.trim() && !isThinking ? {
                        background: "linear-gradient(135deg, #eab308, #ca8a04)",
                        color: "white",
                        boxShadow: "0 6px 16px rgba(202,138,4,0.38)",
                      } : {
                        background: "rgba(202,138,4,0.08)",
                        color: "rgba(202,138,4,0.4)",
                      }),
                    }}
                  >
                    {isThinking
                      ? <><LoaderIcon size={14} style={{ animation: "spin 1.5s linear infinite" }} /> Thinking</>
                      : <><SendIcon size={14} /> Send</>
                    }
                  </motion.button>
                </div>
              </motion.div>

              <p style={{
                textAlign: "center", fontSize: "0.7rem",
                color: "#94a3b8", marginTop: 8,
              }}>
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes floatOrb {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-18px, -22px) scale(1.06); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        *::-webkit-scrollbar { width: 4px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(202,138,4,0.25); border-radius: 99px; }
        textarea::placeholder { color: #a8a29e; }
      `}</style>
    </div>
  );
}