import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6 md:p-8">
      <div className="max-w-4xl w-full mx-auto text-center space-y-8 bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full text-2xl font-bold shadow-lg">
          📄
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            OmniOCR
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Extract clean text from Image — <strong>Nepali, English, Math, Science</strong> — with AI-powered OCR and smart formatting.
        </p>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="p-5 bg-slate-50 rounded-xl border hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">📤</div>
            <h3 className="font-semibold text-gray-800">All Document Types</h3>
            <p className="text-sm text-gray-500">Works with exam papers, textbooks, PDFs, scanned images.</p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-800">AI-Powered Correction</h3>
            <p className="text-sm text-gray-500">Fixes Nepali text, math symbols (∠, ×, π), and layout.</p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">✍️</div>
            <h3 className="font-semibold text-gray-800">Edit & Reuse</h3>
            <p className="text-sm text-gray-500">Edit in TinyMCE, add diagrams, export for teaching or sharing.</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-200"
          >
            🚀 Start Extracting
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-gray-400 mt-8">
          For teachers, students, publishers, and content creators across Nepal and beyond.
        </p>
      </div>
    </main>
  );
}