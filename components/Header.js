"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";

<Image 
  src="/CALMIO.png"
  alt="Calmio Logo" 
  width={32} 
  height={32} 
/>

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  const navLinks = [
    { href: "/", label: "Home", key: "home" },
    { href: "/about", label: "About", key: "about" },
    { href: "/contact", label: "Contact", key: "contact" },
    { href: "/chat", label: "Chat", key: "chat" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <Image src="/CALMIO.png" alt="Calmio Logo" width = {32} height={32}/>
          <span className="brand-text">Calmio</span>
        </Link>

        <nav className="nav">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`nav-link${isActive(link.href) ? " is-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-cta">
          {user ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#f1f5f9",
                  borderRadius: 999,
                  padding: "5px 14px 5px 6px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
                    color: "#fff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {(user.user_metadata?.full_name || user.email)
                    .charAt(0)
                    .toUpperCase()}
                </div>
                {(user.user_metadata?.full_name || user.email).split(" ")[0]}
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "0.88rem",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`nav-link nav-login${pathname === "/login" ? " is-active" : ""}`}
              >
                Log in
              </Link>
              <Link href="/register" className="btn btn-small btn-outline">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
