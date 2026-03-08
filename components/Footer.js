import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <span className="brand-text">Calmio</span>
          <span className="footer-copy">© {year} Calmio Labs. All rights reserved.</span>
        </div>
        <div className="footer-links">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/">Home</Link>
        </div>
      </div>
    </footer>
  );
}
