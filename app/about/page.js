import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

export const metadata = { title: "About · Calmio" };

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
        <div className="container">
          <AnimatedSection>
            <div className="page-heading">
              <p className="badge">
                <span className="badge-dot"></span>
                Our story
              </p>
              <h1>Calmio helps people understand their emotions.</h1>
              <p>
                Calmio was created to give people a simple and private space to reflect on their
                thoughts. Through AI-powered conversations and emotional insights, our mission is
                to help individuals better understand themselves and improve their mental well-being
                over time.
              </p>
            </div>

            <div className="grid-two-column">
              <section>
                <h2>From emotions to insights.</h2>
                <p className="muted">
                  People experience hundreds of emotions and thoughts every day. Many of them pass
                  by unnoticed, making it difficult to understand patterns in our feelings and
                  reactions.
                </p>
                <p className="muted">
                  Calmio helps turn everyday conversations into meaningful emotional insights,
                  allowing users to reflect on their thoughts and recognize patterns in their
                  mental well-being.
                </p>
                <ul className="bullet-list" style={{ marginTop: 18 }}>
                  <li>Private AI conversations designed for self-reflection.</li>
                  <li>Emotional pattern tracking over time.</li>
                  <li>Insights that help you better understand your mental state.</li>
                </ul>
              </section>

              <section>
                <div className="card">
                  <h2 style={{ marginTop: 0, marginBottom: 12 }}>What we believe.</h2>
                  <p className="muted" style={{ marginBottom: 14 }}>
                    We believe emotional well-being should be easier to understand and accessible
                    to everyone. That means:
                  </p>
                  <ul className="bullet-list">
                    <li>Technology that supports reflection, not replaces human connection.</li>
                    <li>Clear insights that help people understand their emotions.</li>
                    <li>Privacy and trust at the center of every conversation.</li>
                  </ul>
                  <p className="muted" style={{ marginTop: 16 }}>
                    Calmio is designed for anyone who wants to better understand their thoughts,
                    recognize emotional patterns, and build healthier habits over time.
                  </p>
                </div>
              </section>
            </div>
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </div>
  );
}
