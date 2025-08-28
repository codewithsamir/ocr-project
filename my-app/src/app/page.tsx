import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-4">OCR Frontend Prototype</h1>
        <p className="mb-6">Upload images or PDFs, extract Nepali + English text, mark math regions, edit in TinyMCE, then download.</p>
        <Link href="/dashboard" className="px-5 py-3 rounded bg-black text-white">Open App</Link>
      </div>
    </main>
  );
}
