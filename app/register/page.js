"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signUp } from "@/lib/auth";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (password !== confirm) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, `${firstName} ${lastName}`);
      setMessage({
        type: "success",
        text: "Account created! Check your email to confirm, then log in.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Sign up failed. Please try again." });
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
        <div className="container grid-two-column">
          <section>
            <div className="page-heading">
              <p className="badge"><span className="badge-dot"></span>Start for free</p>
              <h1>Create your Calmio account.</h1>
              <p>Begin your journey toward emotional clarity with private AI conversations.</p>
            </div>
            <ul className="bullet-list">
              <li>Private AI conversations designed for reflection.</li>
              <li>Emotional pattern tracking across time.</li>
              <li>Clear insights that help you understand yourself better.</li>
            </ul>
          </section>

          <section>
            <div className="card">
              {message && (
                <div style={{
                  marginBottom: 16,
                  padding: "12px 14px",
                  borderRadius: 8,
                  fontSize: 14,
                  background: message.type === "error" ? "#2a1a1a" : "#0d2a1a",
                  color: message.type === "error" ? "#f87171" : "#4ade80",
                  border: `1px solid ${message.type === "error" ? "#7f1d1d" : "#14532d"}`,
                }}>
                  {message.text}
                </div>
              )}
              <form className="form" onSubmit={handleSubmit}>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="first-name">First name</label>
                    <input id="first-name" className="input" type="text" placeholder="Alex" required
                      value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="last-name">Last name</label>
                    <input id="last-name" className="input" type="text" placeholder="Rivera" required
                      value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input id="email" className="input" type="email" placeholder="you@email.com" required
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="password">Password</label>
                    <input id="password" className="input" type="password" placeholder="••••••••" required minLength={6}
                      value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="confirm-password">Confirm password</label>
                    <input id="confirm-password" className="input" type="password" placeholder="••••••••" required
                      value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                  </div>
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" required />
                  <span>I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</span>
                </label>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating account…" : "Create account"}
                  <span className="btn-glow"></span>
                </button>
                <div className="muted" style={{ marginTop: 8 }}>
                  Already using Calmio? <Link href="/login">Log in instead</Link>.
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
