import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export const metadata = { title: "Contact · Calmio" };

export default function ContactPage() {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
        <AnimatedSection className="container grid-two-column">
          <section>
            <div className="page-heading">
              <p className="badge">
                <span className="badge-dot"></span>
                Get in touch
              </p>
              <h1>We&apos;d love to hear from you.</h1>
              <p>
                Have a question, suggestion, or idea? Send us a message and we&apos;ll get back to
                you as soon as possible.
              </p>
            </div>
            <div className="card">
              <h2 style={{ marginTop: 0, marginBottom: 10 }}>Contact us directly</h2>
              <p className="muted" style={{ marginTop: 0, marginBottom: 10 }}>
                Reach us directly at{" "}
                <a href="mailto:hello@calmio.app">hello@calmio.app</a>.
              </p>
              <p className="muted" style={{ margin: 0 }}>
                We aim to respond to every message within one business day.
              </p>
            </div>
          </section>

          <section>
            <div className="card">
              <form className="form">
                <div className="field">
                  <label htmlFor="contact-name">Full name</label>
                  <input id="contact-name" className="input" type="text" placeholder="Alex Rivera" required />
                </div>
                <div className="field">
                  <label htmlFor="contact-email">Email address</label>
                  <input id="contact-email" className="input" type="email" placeholder="you@email.com" required />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="topic">Topic</label>
                    <select id="topic" className="select">
                      <option value="">Select</option>
                      <option>General question</option>
                      <option>Product feedback</option>
                      <option>Technical support</option>
                      <option>Partnership</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="role">Your occupation (optional)</label>
                    <input id="role" className="input" type="text" placeholder="Student, Developer…" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="message">Your message</label>
                  <textarea id="message" className="textarea" placeholder="Tell us how we can help or share your thoughts about Calmio."></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  Submit
                  <span className="btn-glow"></span>
                </button>
              </form>
            </div>
          </section>
        </AnimatedSection>
      </main>
      <Footer />
    </div>
  );
}
