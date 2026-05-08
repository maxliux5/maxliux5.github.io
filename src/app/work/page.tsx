import Link from "next/link";

const projects = [
  {
    title: "Interactive Audio Visualizer",
    description: "Web Audio API based real-time visualization with FFT analysis",
    tags: ["TypeScript", "Web Audio API", "Canvas"],
    link: "#",
  },
  {
    title: "Generative Art Gallery",
    description: "Procedural patterns and algorithmic compositions",
    tags: ["Canvas", "GLSL", "React"],
    link: "#",
  },
  {
    title: "Music Production Tools",
    description: "Browser-based audio processing and synthesis",
    tags: ["Web Audio", "TypeScript", "DSP"],
    link: "#",
  },
];

export default function WorkPage() {
  return (
    <div className="min-h-screen px-8 py-12 max-w-2xl mx-auto">
      <header className="mb-16">
        <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
          ← back
        </Link>
      </header>

      <main>
        <h1 className="text-3xl font-bold text-white mb-2">work</h1>
        <p className="text-gray-500 text-sm mb-12">selected projects</p>

        <div className="space-y-8">
          {projects.map((project) => (
            <article key={project.title} className="group">
              <a href={project.link} className="block">
                <h2 className="text-lg font-medium text-gray-200 group-hover:text-white transition-colors mb-1">
                  {project.title}
                </h2>
                <p className="text-sm text-gray-500 mb-3">{project.description}</p>
                <div className="flex gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded bg-white/5 text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
