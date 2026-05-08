import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between px-8 py-12 max-w-2xl mx-auto">
      <header className="flex justify-between items-center">
        <nav className="flex gap-6 text-sm">
          <Link href="/work" className="hover:text-white transition-colors">work</Link>
          <Link href="/music" className="hover:text-white transition-colors">music</Link>
          <Link href="/about" className="hover:text-white transition-colors">about</Link>
        </nav>
        <a
          href="https://github.com/maxliux5"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:text-white transition-colors"
        >
          gh
        </a>
      </header>

      <main className="flex-1 flex flex-col justify-center py-20">
        <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">
          portfolio
        </h1>
        <p className="text-gray-400 leading-relaxed max-w-lg">
          Building modern web interfaces. Exploring creative coding, generative art, and audio synthesis. Focused on performance, accessibility, and delightful interactions.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/work"
            className="text-sm text-gray-500 hover:text-white transition-colors underline underline-offset-4"
          >
            view projects →
          </Link>
        </div>
      </main>

      <footer className="text-xs text-gray-600">
        © 2024
      </footer>
    </div>
  );
}
