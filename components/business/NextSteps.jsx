'use client';

function Step({ number, text }) {
  return (
    <li className="py-3 border-b border-gray-800 flex items-center gap-3 text-gray-300 last:border-b-0">
      <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
        {number}
      </span>
      <span>{text}</span>
    </li>
  );
}

export default function NextSteps() {
  return (
    <section className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6 mb-6 hover:shadow-2xl hover:shadow-black/20 transition-all">
      <h2 className="mb-4 text-2xl font-bold text-white">📋 Next Steps</h2>
      <ol className="list-none" role="list">
        <Step number={1} text="Define target customer" />
        <Step number={2} text="Draft Lean Canvas (v1)" />
        <Step number={3} text="Set up digital presence plan (domain, landing, socials)" />
      </ol>
    </section>
  );
}
