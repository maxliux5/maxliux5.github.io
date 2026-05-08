import CrystalGlobe from "@/components/CrystalGlobe";

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
    <main className="max-w-2xl mx-auto px-6 py-8">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-12">
        <div className="mono text-xs text-[#999]">
          <span className="bg-black text-white px-2 py-0.5 mr-2">2026.05.08</span>
          <span>portfolio site</span>
        </div>
      </div>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-4">max liu</h1>
        <p className="text-[#666] text-sm leading-relaxed max-w-lg mb-6">
          Developer focused on building interactive web experiences. Here I share
          projects, experiments, and writings on creative coding, generative art,
          and audio synthesis.
        </p>
        <div className="flex items-center gap-4 text-sm text-[#999]">
          <a
            href="https://github.com/maxliux5"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1a1a1a] transition-colors"
          >
            github
          </a>
        </div>
      </header>

      {/* Crystal Globe */}
      <CrystalGlobe />

      {/* 01 Projects */}
      <section>
        <div className="section-header">
          <span className="section-label">01 Projects</span>
          <div className="section-rule" />
        </div>
        <div className="project">
          <a href={projects[0].href} className="font-semibold underline underline-offset-3 hover:text-[#666] transition-colors">
            {projects[0].title}
          </a>
          <p>{projects[0].description}</p>
        </div>
        <div className="project">
          <a href={projects[1].href} className="font-semibold underline underline-offset-3 hover:text-[#666] transition-colors">
            {projects[1].title}
          </a>
          <p>{projects[1].description}</p>
        </div>
        <div className="project">
          <a href={projects[2].href} className="font-semibold underline underline-offset-3 hover:text-[#666] transition-colors">
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
          <a href={prompts[0].href} className="underline underline-offset-3 hover:text-[#666] transition-colors">
            {prompts[0].title}
          </a>
          <p>{prompts[0].description}</p>
        </div>
        <div className="project">
          <a href={prompts[1].href} className="underline underline-offset-3 hover:text-[#666] transition-colors">
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
          <a href={writings[0].href} className="underline underline-offset-3 hover:text-[#666] transition-colors">
            {writings[0].title}
          </a>
          <p>{writings[0].description}</p>
        </div>
        <div className="project">
          <a href={writings[1].href} className="underline underline-offset-3 hover:text-[#666] transition-colors">
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
            className="underline underline-offset-3 hover:text-[#666] transition-colors"
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
            className="underline underline-offset-3 hover:text-[#666] transition-colors"
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
      <footer className="mt-16 pt-8 border-t border-[rgba(0,0,0,0.08)]">
        <p className="mono text-xs text-[#999]">
          max liu &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
