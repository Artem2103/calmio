"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon, SendIcon, LoaderIcon, Paperclip, XIcon,
  MessageSquare, Search, Trash2, Sparkles, Wind,
  BookOpen, Heart, Menu, X, MoreHorizontal, Settings,
} from "lucide-react";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import {
  createSession, getUserSessions, deleteSession,
  saveMessage, getSessionMessages,
} from "@/lib/chatHelpers";

/* ─── Auto-resize textarea hook ─────────────────────────── */
function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);
  const adjustHeight = useCallback((reset) => {
    const el = textareaRef.current;
    if (!el) return;
    if (reset) { el.style.height = `${minHeight}px`; return; }
    el.style.height = `${minHeight}px`;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight ?? Infinity)}px`;
  }, [minHeight, maxHeight]);
  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);
  return { textareaRef, adjustHeight };
}

/* ─── Typing dots ────────────────────────────────────────── */
function TypingDots() {
  return (
    <span className="typing-indicator">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="typing-dot"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/* ─── Suggestion chips ──────────────────────────────────── */
const SUGGESTIONS = [
  { icon: <Heart size={14} />,    label: "How I'm feeling",   text: "I'd like to talk about how I'm feeling today." },
  { icon: <BookOpen size={14} />, label: "Daily reflection",  text: "Help me with a daily reflection." },
  { icon: <Wind size={14} />,     label: "Breathing exercise",text: "Guide me through a breathing exercise." },
  { icon: <Sparkles size={14} />, label: "Track my mood",     text: "I want to track my mood today." },
];

/* ─── Format relative date ──────────────────────────────── */
function formatRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (diffDays < 7) return days[date.getDay()];
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Main ChatApp ───────────────────────────────────────── */
export default function ChatApp() {
  const [inputValue, setInputValue]             = useState("");
  const [messages, setMessages]                 = useState([]);
  const [isThinking, setIsThinking]             = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeChat, setActiveChat]             = useState(null);
  const [inputFocused, setInputFocused]         = useState(false);
  const [mousePos, setMousePos]                 = useState({ x: 0, y: 0 });
  const [attachments, setAttachments]           = useState([]);
  const [searchQuery, setSearchQuery]           = useState("");
  const [user, setUser]                         = useState(null);
  const [sessions, setSessions]                 = useState([]);
  const [sessionsLoading, setSessionsLoading]   = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [, startTransition]                     = useTransition();
  const messagesEndRef = useRef(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 52, maxHeight: 200 });

  /* load user + sessions */
  useEffect(() => {
    async function init() {
      try {
        const u = await getCurrentUser();
        setUser(u);
        if (u) {
          const data = await getUserSessions(u.id);
          setSessions(data || []);
        }
      } catch (e) {
        console.error("Init error:", e);
      } finally {
        setSessionsLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const selectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setActiveChat(sessionId);
    setMobileSidebarOpen(false);
    try {
      const msgs = await getSessionMessages(sessionId);
      setMessages((msgs || []).map((m) => ({ id: m.id, role: m.role, text: m.content })));
    } catch (e) {
      console.error("Failed to load messages:", e);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue("");
    adjustHeight(true);

    let sessionId = currentSessionId;

    if (!sessionId && user) {
      try {
        const title = text.length > 40 ? text.slice(0, 40) + "…" : text;
        const newSession = await createSession(user.id, title);
        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        setActiveChat(sessionId);
        setSessions((prev) => [newSession, ...prev]);
      } catch (e) { console.error("Failed to create session:", e); }
    }

    const userMsg = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    if (sessionId) {
      try { await saveMessage(sessionId, "user", text); }
      catch (e) { console.error("Failed to save user message:", e); }
    }

    setIsThinking(true);
    startTransition(() => {
      setTimeout(async () => {
        setIsThinking(false);
        const aiText = "Update will be soon...";
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: "ai", text: aiText }]);
        if (sessionId) {
          try { await saveMessage(sessionId, "assistant", aiText); }
          catch (e) { console.error("Failed to save AI message:", e); }
        }
      }, 2200);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const startNewChat = () => {
    setMessages([]); setCurrentSessionId(null); setActiveChat(null); setMobileSidebarOpen(false);
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setMessages([]); setCurrentSessionId(null); setActiveChat(null);
      }
    } catch (err) { console.error("Failed to delete session:", err); }
  };

  const filteredSessions = sessions.filter((s) =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasMessages = messages.length > 0;

  /* ─── Sidebar content (shared by desktop + mobile) ─────── */
  const SidebarContent = () => (
    <>
      <div className="sidebar-top">
        <button className="new-chat-btn" onClick={startNewChat}>
          <PlusIcon size={15} /> New conversation
        </button>
        <div className="sidebar-search">
          <Search size={13} className="sidebar-search-icon" />
          <input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="chat-history">
        <p className="sidebar-section-label">Recent</p>

        {sessionsLoading ? (
          <div className="empty-history">Loading…</div>
        ) : !user ? (
          <div className="empty-history">
            <a href="/login">Log in</a> to save and view your conversation history.
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="empty-history">
            {searchQuery
              ? "No conversations match your search."
              : "No conversations yet. Start chatting to save your history."}
          </div>
        ) : (
          filteredSessions.map((session, i) => (
            <motion.div
              key={session.id}
              className={`history-item${activeChat === session.id ? " is-active" : ""}`}
              onClick={() => selectSession(session.id)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="history-item-icon">
                <MessageSquare size={13} />
              </div>
              <div className="history-item-body">
                <p className="history-item-title">{session.title || "Untitled"}</p>
                <p className="history-item-meta">{formatRelativeDate(session.created_at)}</p>
              </div>
              <button
                className="history-item-delete"
                onClick={(e) => handleDeleteSession(e, session.id)}
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user
              ? (user.user_metadata?.full_name || user.email || "?").charAt(0).toUpperCase()
              : "?"}
          </div>
          <div className="user-info">
            <p className="user-name">
              {user ? (user.user_metadata?.full_name || user.email) : "Guest"}
            </p>
            <p className="user-plan">Free plan</p>
          </div>
          <Settings size={14} className="sidebar-settings-icon" />
        </div>
      </div>
    </>
  );

  return (
    <div className="chat-page-shell">
      {/* Ambient orbs */}
      <div className="chat-bg-orbs" aria-hidden="true">
        <div className="chat-orb chat-orb-1" />
        <div className="chat-orb chat-orb-2" />
      </div>

      {/* Mouse-follow glow */}
      {inputFocused && (
        <motion.div
          className="chat-mouse-glow"
          animate={{ left: mousePos.x, top: mousePos.y }}
          transition={{ type: "spring", damping: 30, stiffness: 100, mass: 0.5 }}
        />
      )}

      {/* Shared header — same as every other page */}
      <div className="chat-header-wrapper">
        <Header />
      </div>

      {/* App body */}
      <div className="chat-body">

        {/* Desktop sidebar — always visible */}
        <aside className="chat-sidebar chat-sidebar--desktop">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar backdrop */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              className="sidebar-backdrop is-open"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile sidebar overlay */}
        <motion.aside
          className="chat-sidebar chat-sidebar--mobile"
          animate={{ x: mobileSidebarOpen ? 0 : -280 }}
          initial={{ x: -280 }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
        >
          <div className="mobile-sidebar-close-row">
            <button className="topbar-btn" onClick={() => setMobileSidebarOpen(false)}>
              <X size={15} />
            </button>
          </div>
          <SidebarContent />
        </motion.aside>

        {/* Main chat area */}
        <main className="chat-main">

          {/* Mobile topbar */}
          <div className="chat-mobile-topbar">
            <button className="sidebar-toggle" onClick={() => setMobileSidebarOpen(true)}>
              <Menu size={15} />
            </button>
            <span className="chat-topbar-title">
              {activeChat
                ? sessions.find((s) => s.id === activeChat)?.title || "Conversation"
                : "New conversation"}
            </span>
          </div>

          {/* Active-chat title bar */}
          <AnimatePresence>
            {hasMessages && (
              <motion.div
                className="chat-topbar"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                <div className="topbar-left">
                  <span className="chat-topbar-title">
                    {activeChat
                      ? sessions.find((s) => s.id === activeChat)?.title || "Conversation"
                      : "New conversation"}
                  </span>
                </div>
                <div className="topbar-actions">
                  <button className="topbar-btn"><MoreHorizontal size={15} /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages / Welcome */}
          <div className="chat-messages">
            {!hasMessages ? (
              <motion.div
                className="chat-welcome"
                initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="welcome-orb"
                  animate={{
                    boxShadow: [
                      "0 0 0 10px rgba(253,230,138,0.22),0 0 0 20px rgba(253,230,138,0.08),0 20px 50px rgba(202,138,4,0.4)",
                      "0 0 0 14px rgba(253,230,138,0.16),0 0 0 28px rgba(253,230,138,0.06),0 24px 60px rgba(202,138,4,0.55)",
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1 className="welcome-title">How are you feeling today?</h1>
                  <motion.div
                    className="welcome-title-line"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ delay: 0.55, duration: 0.9 }}
                  />
                </motion.div>
                <motion.p
                  className="welcome-subtitle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  Share what's on your mind — I'm here to listen and help you reflect.
                </motion.p>
                <div className="prompt-suggestions">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s.label}
                      className="prompt-card"
                      onClick={() => { setInputValue(s.text); textareaRef.current?.focus(); }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="prompt-card-icon">{s.icon}</span>
                      <span className="prompt-card-text">{s.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="messages-inner">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`message-row ${msg.role === "user" ? "user-row" : "ai-row"}`}
                    initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={`msg-avatar ${msg.role === "user" ? "user-avatar-bubble" : "ai-avatar"}`}>
                      {msg.role === "user" ? "A" : "C"}
                    </div>
                    <div className="msg-bubble">{msg.text}</div>
                  </motion.div>
                ))}

                <AnimatePresence>
                  {isThinking && (
                    <motion.div
                      className="message-row ai-row"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    >
                      <div className="msg-avatar ai-avatar" />
                      <div className="msg-bubble">
                        Thinking <TypingDots />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="chat-input-area">
            <div className="chat-input-wrap">
              <motion.div
                className={`chat-input-box${inputFocused ? " is-focused" : ""}`}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <AnimatePresence>
                  {attachments.length > 0 && (
                    <motion.div
                      className="chat-attachments"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    >
                      {attachments.map((file, idx) => (
                        <motion.div key={idx} className="chat-attachment-chip"
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        >
                          {file}
                          <button onClick={() => setAttachments(p => p.filter((_, i) => i !== idx))}>
                            <XIcon size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); adjustHeight(); }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Share what's on your mind…"
                />

                <div className="input-actions-row">
                  <div className="input-actions">
                    <motion.button
                      className="input-btn"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setAttachments(p => [...p, `file-${Math.floor(Math.random() * 100)}.pdf`])}
                    >
                      <Paperclip size={15} />
                    </motion.button>
                  </div>

                  <motion.button
                    className={`send-btn${(!inputValue.trim() || isThinking) ? " send-btn--disabled" : ""}`}
                    onClick={handleSend}
                    disabled={isThinking || !inputValue.trim()}
                    whileHover={inputValue.trim() && !isThinking ? { scale: 1.03 } : {}}
                    whileTap={inputValue.trim() && !isThinking ? { scale: 0.96 } : {}}
                  >
                    {isThinking
                      ? <><LoaderIcon size={14} className="spin-icon" /> Thinking</>
                      : <><SendIcon   size={14} /> Send</>}
                  </motion.button>
                </div>
              </motion.div>

              <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}