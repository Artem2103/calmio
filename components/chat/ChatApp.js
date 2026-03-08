"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getCurrentUser, signIn, signOut, signUp } from "@/lib/auth";
import {
  createSession,
  getUserSessions,
  deleteSession,
  saveMessage,
  getSessionMessages,
} from "@/lib/chatHelpers";

// ── Constants ────────────────────────────────────────────────────
const GUEST_LIMIT = 5;
const LOCAL_KEY = "calmio_sessions";

// ── Local storage helpers ────────────────────────────────────────
function localGet() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch { return []; }
}
function localSave(sessions) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(sessions));
}
function generateId() {
  return "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}
function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Mock AI reply ────────────────────────────────────────────────
function getMockReply(text) {
  const t = text.toLowerCase();
  if (t.includes("stress") || t.includes("overwhelm"))
    return "I hear you — stress can feel like a constant weight. Let's unpack this together. What's been the main source lately? Is it something specific, or more of a general sense of being stretched thin?";
  if (t.includes("sleep") || t.includes("anxious") || t.includes("anxiety"))
    return "Sleep and anxiety are deeply connected. When your mind is racing, rest feels impossible. Can you tell me more about what happens when you try to sleep — is it trouble falling asleep, staying asleep, or waking too early?";
  if (t.includes("habit") || t.includes("routine"))
    return "Building habits that stick is less about willpower and more about small, sustainable cues. What's one area of your well-being you'd most like to improve — sleep, movement, mindfulness, or something else?";
  if (t.includes("sad") || t.includes("depress") || t.includes("lonely"))
    return "Thank you for trusting me with that. Those feelings are real, and they matter. When did you first notice this sense of sadness? Sometimes tracing it back helps us understand what it's really about.";
  return "Thank you for sharing that with me. An update will be soon...";
}

// ── Date grouping ────────────────────────────────────────────────
function groupByDate(sessions) {
  const now = Date.now(), DAY = 86400000;
  const groups = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This week", items: [] },
    { label: "Older", items: [] },
  ];
  sessions.forEach((s) => {
    const age = now - new Date(s.created_at).getTime();
    if (age < DAY) groups[0].items.push(s);
    else if (age < DAY * 2) groups[1].items.push(s);
    else if (age < DAY * 7) groups[2].items.push(s);
    else groups[3].items.push(s);
  });
  return groups.filter((g) => g.items.length > 0);
}

// ════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════
export default function ChatApp() {
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [topbarTitle, setTopbarTitle] = useState("New conversation");
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState([false, false, false, false]);

  // Guest limit
  const [guestMsgCount, setGuestMsgCount] = useState(0);
  const [chatLocked, setChatLocked] = useState(false);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historySearch, setHistorySearch] = useState("");
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [gateError, setGateError] = useState("");
  const [gateLoading, setGateLoading] = useState(false);
  const [gateEmail, setGateEmail] = useState("");
  const [gatePassword, setGatePassword] = useState("");
  const [gateName, setGateName] = useState("");
  const [gateRegisterEmail, setGateRegisterEmail] = useState("");
  const [gateRegisterPassword, setGateRegisterPassword] = useState("");
  const [gateSuccess, setGateSuccess] = useState("");

  const chatMessagesRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // ── Auth check ────────────────────────────────────────────────
  useEffect(() => {
    getCurrentUser()
      .then((u) => { setUser(u); setUserLoaded(true); })
      .catch(() => { setUser(null); setUserLoaded(true); });
  }, []);

  // ── Welcome animation ─────────────────────────────────────────
  useEffect(() => {
    requestAnimationFrame(() => {
      setWelcomeVisible(true);
      [0, 1, 2, 3].forEach((i) =>
        setTimeout(() => setCardsVisible((prev) => { const n = [...prev]; n[i] = true; return n; }), 120 + i * 80)
      );
    });
  }, []);

  // ── Load sessions ─────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    if (user) {
      try {
        const data = await getUserSessions(user.id);
        setSessions(data);
      } catch { setSessions([]); }
    } else {
      const local = localGet().map((s) => ({
        id: s.id,
        title: s.title,
        created_at: new Date(s.updatedAt || Date.now()).toISOString(),
        _local: true,
        _messages: s.messages,
      }));
      setSessions(local);
    }
  }, [user]);

  useEffect(() => {
    if (userLoaded) fetchSessions();
  }, [userLoaded, fetchSessions]);

  // ── Scroll to bottom ──────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTo({
          top: chatMessagesRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  // ── Sidebar toggle (mobile) ───────────────────────────────────
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 860;

  // ── Load a session ────────────────────────────────────────────
  async function loadSession(id, title) {
    setActiveSessionId(id);
    setTopbarTitle(title || "Conversation");
    setShowWelcome(false);

    let dbMessages = [];
    if (user) {
      try { dbMessages = await getSessionMessages(id); } catch {}
    } else {
      const s = localGet().find((s) => s.id === id);
      dbMessages = s?.messages || [];
    }
    setMessages(dbMessages.map((m) => ({ role: m.role, content: m.content })));
    if (window.innerWidth <= 860) setSidebarOpen(false);
  }

  // ── Persist helpers ───────────────────────────────────────────
  async function persistSession(localId, title) {
    if (user) {
      try { return await createSession(user.id, title); } catch { return { id: localId }; }
    }
    const s = localGet();
    s.unshift({ id: localId, title, messages: [], updatedAt: Date.now() });
    localSave(s);
    return { id: localId };
  }

  async function persistMessage(sessionId, role, content) {
    if (user) {
      try { await saveMessage(sessionId, role, content); } catch (e) { console.error(e); }
      return;
    }
    const s = localGet();
    const session = s.find((x) => x.id === sessionId);
    if (session) { session.messages.push({ role, content }); session.updatedAt = Date.now(); localSave(s); }
  }

  async function removeSession(id) {
    if (user) { try { await deleteSession(id); } catch {} }
    else { localSave(localGet().filter((s) => s.id !== id)); }
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) resetChat();
  }

  // ── Reset chat ────────────────────────────────────────────────
  function resetChat() {
    setMessages([]);
    setActiveSessionId(null);
    setTopbarTitle("New conversation");
    setShowWelcome(true);
    setInput("");
    setWelcomeVisible(false);
    setCardsVisible([false, false, false, false]);
    requestAnimationFrame(() => {
      setWelcomeVisible(true);
      [0, 1, 2, 3].forEach((i) =>
        setTimeout(() => setCardsVisible((prev) => { const n = [...prev]; n[i] = true; return n; }), 120 + i * 80)
      );
    });
    if (!user) {
      setChatLocked(false);
      setGuestMsgCount(0);
    }
  }

  // ── Send message ──────────────────────────────────────────────
  async function sendMessage(textOverride) {
    const text = (textOverride || input).trim();
    if (!text || isTyping || chatLocked) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      const title = text.slice(0, 44) + (text.length > 44 ? "…" : "");
      setTopbarTitle(title);
      const localId = generateId();
      const result = await persistSession(localId, title);
      sessionId = result?.id || localId;
      setActiveSessionId(sessionId);
      await fetchSessions();
    }

    setShowWelcome(false);
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    await persistMessage(sessionId, "user", text);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const newGuestCount = !user ? guestMsgCount + 1 : guestMsgCount;
    if (!user) setGuestMsgCount(newGuestCount);

    // AI reply
    setIsTyping(true);
    setTimeout(async () => {
      const reply = getMockReply(text);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setIsTyping(false);
      await persistMessage(sessionId, "assistant", reply);
      if (!user && newGuestCount >= GUEST_LIMIT) {
        setAuthGateOpen(true);
      }
    }, 1400 + Math.random() * 800);
  }

  // ── Auth gate handlers ────────────────────────────────────────
  async function handleGateLogin(e) {
    e.preventDefault();
    setGateLoading(true);
    setGateError("");
    try {
      await signIn(gateEmail, gatePassword);
      window.location.reload();
    } catch (err) {
      setGateError(err.message || "Login failed.");
      setGateLoading(false);
    }
  }

  async function handleGateRegister(e) {
    e.preventDefault();
    setGateLoading(true);
    setGateError("");
    try {
      await signUp(gateRegisterEmail, gateRegisterPassword, gateName);
      setGateSuccess(`Check your email at ${gateRegisterEmail} to confirm, then log in.`);
    } catch (err) {
      setGateError(err.message || "Sign up failed.");
      setGateLoading(false);
    }
  }

  function closeAuthGate() {
    setAuthGateOpen(false);
    setChatLocked(true);
  }

  // ── Filtered sessions ─────────────────────────────────────────
  const filteredSessions = historySearch
    ? sessions.filter((s) => s.title.toLowerCase().includes(historySearch.toLowerCase()))
    : sessions;
  const grouped = groupByDate(filteredSessions);

  const userName = user?.user_metadata?.full_name || user?.email || "Guest";
  const userLetter = userName.charAt(0).toUpperCase();

  const PROMPT_CARDS = [
    { emoji: "😰", text: "I'm feeling stressed", sub: "Talk through what's on your mind", prompt: "I'm feeling really stressed lately and I don't know how to cope." },
    { emoji: "🔍", text: "Reflect on my emotions", sub: "Explore your inner world", prompt: "I'd like to reflect on my emotions and understand them better." },
    { emoji: "🌙", text: "Sleep & anxiety", sub: "Understand your rest patterns", prompt: "I've been having trouble sleeping because of anxiety." },
    { emoji: "🌱", text: "Build better habits", sub: "Small steps, lasting change", prompt: "I want to build better habits and improve my daily routine." },
  ];

  return (
    <div className="page-shell" data-page="chat-home" style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* ── Nav ──────────────────────────────────────────────── */}
      <header className="site-header">
        <nav className="nav-inner">
          <Link href="/" className="nav-brand">
            <div className="brand-orb"></div>
            <span>CALMIO</span>
          </Link>
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/chat">Chat</Link></li>
          </ul>
          <div className="nav-actions">
            {user ? (
              <>
                <div className="nav-user-pill">
                  <div className="nav-user-avatar">{userLetter}</div>
                  {userName.split(" ")[0]}
                </div>
                <button
                  onClick={async () => { await signOut(); window.location.href = "/login"; }}
                  className="btn-ghost"
                  style={{ fontSize: "0.82rem", background: "none", border: "none", cursor: "pointer" }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">Log in</Link>
                <Link href="/register" className="btn-primary">Get started</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── App grid ─────────────────────────────────────────── */}
      <div className={`chat-app${sidebarOpen ? " sidebar-open" : ""}`} style={{ flex: 1, minHeight: 0 }}>
        {/* Backdrop (mobile) */}
        <div
          className={`sidebar-backdrop${sidebarOpen ? " is-open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className={`chat-sidebar${sidebarOpen ? " is-open" : ""}`}>
          <div className="sidebar-top">
            <button className="new-chat-btn" onClick={resetChat}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New conversation
            </button>
            <div className="sidebar-search">
              <svg className="sidebar-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search conversations…"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
          </div>

          <div className="chat-history">
            {grouped.length === 0 ? (
              <div className="empty-history"><p>No conversations yet.<br />Start a new chat!</p></div>
            ) : (
              grouped.map(({ label, items }) => (
                <div key={label}>
                  <div className="sidebar-section-label">{label}</div>
                  {items.map((s) => (
                    <button
                      key={s.id}
                      className={`history-item${s.id === activeSessionId ? " is-active" : ""}`}
                      onClick={() => loadSession(s.id, s.title)}
                    >
                      <div className="history-item-icon">✦</div>
                      <div className="history-item-body">
                        <div className="history-item-title"
                          dangerouslySetInnerHTML={{ __html: escapeHtml(s.title) }}
                        />
                        <div className="history-item-meta">
                          {s._messages
                            ? `${s._messages.length} messages`
                            : new Date(s.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        className="history-item-delete"
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); removeSession(s.id); }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="user-avatar">{userLetter}</div>
              <div className="user-info">
                <div className="user-name">{userName}</div>
                <div className="user-plan">
                  {user ? "Free plan" : (
                    <Link href="/login" style={{ color: "#a78bfa" }}>Log in to save chats</Link>
                  )}
                </div>
              </div>
            </div>
            {user && (
              <button
                className="history-item"
                style={{ marginTop: 8, color: "#f87171", width: "100%" }}
                onClick={async () => { try { await signOut(); } catch {} window.location.href = "/login"; }}
              >
                <div className="history-item-icon">↩</div>
                <div className="history-item-body"><div className="history-item-title">Log out</div></div>
              </button>
            )}
          </div>
        </aside>

        {/* ── Main chat ──────────────────────────────────────────── */}
        <main className="chat-main">
          <div className="chat-topbar">
            <div className="topbar-left">
              <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Toggle sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
              <span className="chat-topbar-title">{topbarTitle}</span>
            </div>
            <div className="topbar-actions">
              <button className="topbar-btn" title="Breathing exercise">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 1 10 10c0 4-3 7-7 8" /><path d="M12 22A10 10 0 0 1 2 12c0-4 3-7 7-8" />
                </svg>
              </button>
              <button className="topbar-btn" onClick={resetChat} title="Clear current chat">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                </svg>
              </button>
            </div>
          </div>

          <div className="chat-messages" ref={chatMessagesRef}>
            {/* Welcome */}
            {showWelcome && (
              <div className={`chat-welcome${welcomeVisible ? " is-visible" : ""}`}>
                <div className="welcome-orb"></div>
                <h1 className="welcome-title">How are you feeling today?</h1>
                <p className="welcome-subtitle">I&apos;m here to listen. Share what&apos;s on your mind and we&apos;ll work through it together.</p>
                <div className="prompt-suggestions">
                  {PROMPT_CARDS.map((card, i) => (
                    <button
                      key={i}
                      className={`prompt-card${cardsVisible[i] ? " is-visible" : ""}`}
                      onClick={() => { if (!chatLocked) sendMessage(card.prompt); }}
                    >
                      <span className="prompt-card-icon">{card.emoji}</span>
                      <div className="prompt-card-text">{card.text}</div>
                      <div className="prompt-card-sub">{card.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {!showWelcome && (
              <div className="messages-inner">
                {messages.map((msg, i) => (
                  <div key={i} className={`message-row ${msg.role === "user" ? "user-row" : "ai-row"}`}>
                    <div className={`msg-avatar ${msg.role === "user" ? "user-avatar-bubble" : "ai-avatar"}`}>
                      {msg.role === "user"
                        ? (user?.user_metadata?.full_name?.charAt(0) || "Y").toUpperCase()
                        : "✦"}
                    </div>
                    <div className="msg-bubble">
                      <div className="msg-name">
                        {msg.role === "user" ? (user?.user_metadata?.full_name || "You") : "Calmio"}
                      </div>
                      <div>{msg.content}</div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="message-row ai-row">
                    <div className="msg-avatar ai-avatar">✦</div>
                    <div className="msg-bubble">
                      <div className="msg-name">Calmio</div>
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="chat-input-area">
            <div className="chat-input-wrap">
              <div className={`chat-input-box${chatLocked ? " is-locked" : ""}`}>
                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  placeholder="Share what's on your mind…"
                  rows={1}
                  value={input}
                  disabled={chatLocked}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!chatLocked && input.trim()) sendMessage();
                    }
                  }}
                />
                <div className="input-actions">
                  <button className="input-btn" title="Attach file">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  <button
                    className="send-btn"
                    disabled={chatLocked || !input.trim() || isTyping}
                    onClick={() => sendMessage()}
                    title="Send message"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                    </svg>
                  </button>
                </div>
              </div>
              {chatLocked ? (
                <p className="locked-hint">
                  <button
                    onClick={() => setAuthGateOpen(true)}
                    style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "inherit" }}
                  >
                    Sign up or log in
                  </button>{" "}
                  to continue this conversation.
                </p>
              ) : (
                <p className="input-hint">Calmio is an AI — not a licensed therapist. For emergencies, please seek professional help.</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Auth Gate Modal ─────────────────────────────────────── */}
      {authGateOpen && (
        <div className="auth-gate-overlay is-open" onClick={(e) => { if (e.target === e.currentTarget) closeAuthGate(); }}>
          <div className="auth-gate-modal">
            <button className="auth-gate-close" onClick={closeAuthGate} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="auth-gate-orb"></div>
            <h2 className="auth-gate-title">You&apos;ve reached the free limit</h2>
            <p className="auth-gate-sub">Create a free account to continue your conversation and save your chat history.</p>

            {gateError && <div className="auth-gate-error">{gateError}</div>}

            {gateSuccess ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>✉️</div>
                <p style={{ fontWeight: 600, marginBottom: 6 }}>Check your email!</p>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>{gateSuccess}</p>
              </div>
            ) : (
              <>
                <div className="auth-gate-tabs">
                  <button
                    className={`auth-gate-tab${authTab === "login" ? " is-active" : ""}`}
                    onClick={() => { setAuthTab("login"); setGateError(""); }}
                  >Log in</button>
                  <button
                    className={`auth-gate-tab${authTab === "register" ? " is-active" : ""}`}
                    onClick={() => { setAuthTab("register"); setGateError(""); }}
                  >Sign up</button>
                </div>

                {authTab === "login" ? (
                  <form className="auth-gate-form" onSubmit={handleGateLogin}>
                    <input className="auth-gate-input" type="email" placeholder="Email address" required value={gateEmail} onChange={(e) => setGateEmail(e.target.value)} />
                    <input className="auth-gate-input" type="password" placeholder="Password" required value={gatePassword} onChange={(e) => setGatePassword(e.target.value)} />
                    <button type="submit" className="auth-gate-btn" disabled={gateLoading}>
                      {gateLoading ? "Logging in…" : "Log in"}
                    </button>
                  </form>
                ) : (
                  <form className="auth-gate-form" onSubmit={handleGateRegister}>
                    <input className="auth-gate-input" type="text" placeholder="Full name" required value={gateName} onChange={(e) => setGateName(e.target.value)} />
                    <input className="auth-gate-input" type="email" placeholder="Email address" required value={gateRegisterEmail} onChange={(e) => setGateRegisterEmail(e.target.value)} />
                    <input className="auth-gate-input" type="password" placeholder="Password (min 6 chars)" required minLength={6} value={gateRegisterPassword} onChange={(e) => setGateRegisterPassword(e.target.value)} />
                    <button type="submit" className="auth-gate-btn" disabled={gateLoading}>
                      {gateLoading ? "Creating account…" : "Create free account"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
