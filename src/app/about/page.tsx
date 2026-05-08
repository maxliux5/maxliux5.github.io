import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen px-8 py-12 max-w-2xl mx-auto">
      <header className="mb-16">
        <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
          ← back
        </Link>
      </header>

      <main>
        <h1 className="text-3xl font-bold text-white mb-8">about</h1>

        <div className="space-y-6 text-gray-400 leading-relaxed">
          <p>
            Developer focused on building interactive web experiences. Interested in creative coding,
            generative art, and audio synthesis.
          </p>

          <p>
            Currently exploring Web Audio API, WebGL, and real-time graphics. Previously worked on
            performance optimization and design systems.
          </p>

          <div className="pt-6">
            <h2 className="text-sm font-medium text-gray-300 mb-4">skills</h2>
            <div className="flex flex-wrap gap-2">
              {["TypeScript", "React", "Next.js", "WebGL", "Web Audio", "Node.js", "Python"].map(
                (skill) => (
                  <span
                    key={skill}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-400"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="pt-6">
            <h2 className="text-sm font-medium text-gray-300 mb-4">contact</h2>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:contact@example.com"
                className="block text-gray-500 hover:text-white transition-colors"
              >
                email →
              </a>
              <a
                href="https://github.com/maxliux5"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-500 hover:text-white transition-colors"
              >
                github →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
