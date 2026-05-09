import BackgroundEffect from "@/components/BackgroundEffect";

const projects = [
  {
    title: "Interactive Audio Visualizer",
    description:
      "Web Audio API based real-time visualization with FFT analysis",
    href: "#",
  },
  {
    title: "Generative Art Gallery",
    description: "Procedural patterns and algorithmic compositions",
    href: "#",
  },
  {
    title: "Music Production Tools",
    description: "Browser-based audio processing and synthesis",
    href: "#",
  },
];

const prompts = [
  {
    title: "Ambient Sound Designer",
    description: "A prompt for generating atmospheric soundscapes",
    href: "#",
  },
  {
    title: "Code Review Assistant",
    description: "Structured approach to thoughtful code feedback",
    href: "#",
  },
];

const writings = [
  {
    title: "The Art of Generative Systems",
    description: "Exploring patterns in algorithmic art",
    href: "#",
  },
  {
    title: "Web Audio Deep Dive",
    description: "Building real-time audio applications",
    href: "#",
  },
];

const influences = [
  {
    title: "Structure and Interpretation of Computer Programs",
    description:
      "Abelson and Sussman's classic transformed how I think about computation",
    href: "#",
  },
  {
    title: "The Art of Computer Programming",
    description: "Knuth's comprehensive treatment of algorithms",
    href: "#",
  },
];

export default function Home() {
  return (
    <>
      <BackgroundEffect />
      <div className="page-container">
        <main className="glass-content">
          <div className="top-bar">
            <div className="eyebrow">
              <span className="date-chip">2026.05.08</span>
              <span>portfolio site</span>
            </div>
          </div>

          <header className="hero-copy">
            <h1>max liu</h1>
            <p>
              Developer focused on building interactive web experiences. Here I share
              projects, experiments, and writings on creative coding, generative art,
              and audio synthesis.
            </p>
            <div className="social-links">
              <a
                href="https://github.com/maxliux5"
                target="_blank"
                rel="noopener noreferrer"
              >
                github
              </a>
            </div>
          </header>

          {/* 01 Projects */}
          <section>
            <div className="section-header">
              <span className="section-label">01 Projects</span>
              <div className="section-rule" />
            </div>
            <div className="project">
              <a href={projects[0].href}>
                {projects[0].title}
              </a>
              <p>{projects[0].description}</p>
            </div>
            <div className="project">
              <a href={projects[1].href}>
                {projects[1].title}
              </a>
              <p>{projects[1].description}</p>
            </div>
            <div className="project">
              <a href={projects[2].href}>
                {projects[2].title}
              </a>
              <p>{projects[2].description}</p>
            </div>
          </section>

          {/* 02 Prompts */}
          <section>
            <div className="section-header">
              <span className="section-label">02 Prompts</span>
              <div className="section-rule" />
            </div>
            <div className="project">
              <a href={prompts[0].href}>
                {prompts[0].title}
              </a>
              <p>{prompts[0].description}</p>
            </div>
            <div className="project">
              <a href={prompts[1].href}>
                {prompts[1].title}
              </a>
              <p>{prompts[1].description}</p>
            </div>
          </section>

          {/* 03 Writings */}
          <section>
            <div className="section-header">
              <span className="section-label">03 Writings</span>
              <div className="section-rule" />
            </div>
            <div className="project">
              <a href={writings[0].href}>
                {writings[0].title}
              </a>
              <p>{writings[0].description}</p>
            </div>
            <div className="project">
              <a href={writings[1].href}>
                {writings[1].title}
              </a>
              <p>{writings[1].description}</p>
            </div>
          </section>

          {/* 04 What Shapes Me */}
          <section>
            <div className="section-header">
              <span className="section-label">04 What Shapes Me</span>
              <div className="section-rule" />
            </div>
            <div className="project">
              <a
                href={influences[0].href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {influences[0].title}
              </a>
              <p>{influences[0].description}</p>
            </div>
            <div className="project">
              <a
                href={influences[1].href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {influences[1].title}
              </a>
              <p>{influences[1].description}</p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="section-header">
              <span className="section-label">Contact</span>
              <div className="section-rule" />
            </div>
            <div className="contact-block">
              <p>
                If you would like to continue the conversation, feel free to write to me.
              </p>
              <div className="contact-links">
                <a href="mailto:contact@example.com">contact@example.com</a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer>
            <p className="mono">
              max liu &copy; {new Date().getFullYear()}
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
