"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      router.push("/chat");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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
              <p className="badge"><span className="badge-dot"></span>Welcome back</p>
              <h1>Log in to your Calmio account.</h1>
              <p>
                Continue your conversations, explore your emotional insights, and track how your
                thoughts evolve over time.
              </p>
            </div>
            <p className="muted">
              New to Calmio?{" "}
              <Link href="/register">Create your account</Link> and start today.
            </p>
          </section>

          <section>
            <div className="card">
              {error && (
                <div style={{
                  marginBottom: 16,
                  padding: "12px 14px",
                  borderRadius: 8,
                  fontSize: 14,
                  background: "#2a1a1a",
                  color: "#f87171",
                  border: "1px solid #7f1d1d",
                }}>
                  {error}
                </div>
              )}
              <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="login-email">Email address</label>
                  <input
                    id="login-email"
                    className="input"
                    type="email"
                    placeholder="you@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="form-footer">
                  <label className="checkbox-row">
                    <input type="checkbox" />
                    <span>Keep me signed in</span>
                  </label>
                  <a href="#">Forgot password?</a>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Logging in…" : "Log in"}
                  <span className="btn-glow"></span>
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
