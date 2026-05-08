import Link from "next/link";

const tracks = [
  { title: "Ambient Drone #1", duration: "4:32", date: "2024-01" },
  { title: "Generative Patterns", duration: "3:15", date: "2024-02" },
  { title: "Modular Experiments", duration: "5:48", date: "2024-03" },
];

export default function MusicPage() {
  return (
    <div className="min-h-screen px-8 py-12 max-w-2xl mx-auto">
      <header className="mb-16">
        <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
          ← back
        </Link>
      </header>

      <main>
        <h1 className="text-3xl font-bold text-white mb-2">music</h1>
        <p className="text-gray-500 text-sm mb-12">experimental audio</p>

        <div className="space-y-4">
          {tracks.map((track) => (
            <div
              key={track.title}
              className="flex justify-between items-center py-3 border-b border-white/5"
            >
              <div>
                <h3 className="text-sm font-medium text-gray-300">{track.title}</h3>
                <span className="text-xs text-gray-600">{track.date}</span>
              </div>
              <span className="text-xs text-gray-600">{track.duration}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-lg bg-white/5 border border-white/5">
          <p className="text-sm text-gray-400 mb-4">
            Audio player coming soon. Currently working on Web Audio API implementation.
          </p>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-white/20 rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
}
