'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProLaunchSection() {
  const [selectedName, setSelectedName] = useState('teamai');

  return (
    <section className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-8 mb-8 border-l-4 border-teal-500" role="region" aria-label="ProLaunch Virtual Company">
      <h2 className="text-2xl lg:text-3xl font-bold text-teal-400 mb-2">ProLaunch Virtual Company</h2>
      <p className="text-gray-400 mb-6">Run CEO, HR, Finance, Sales, Admin & Support with AI.</p>

      <ul className="list-none mb-6 grid grid-cols-1 md:grid-cols-2 gap-2">
        <li className="flex items-center gap-2 py-2 text-gray-300">
          <span className="text-teal-400 font-bold">▸</span>
          Admin emails & scheduling
        </li>
        <li className="flex items-center gap-2 py-2 text-gray-300">
          <span className="text-teal-400 font-bold">▸</span>
          Cold calling & appointment setting
        </li>
        <li className="flex items-center gap-2 py-2 text-gray-300">
          <span className="text-teal-400 font-bold">▸</span>
          Invoices & payroll
        </li>
        <li className="flex items-center gap-2 py-2 text-gray-300">
          <span className="text-teal-400 font-bold">▸</span>
          Executive reports
        </li>
      </ul>

      <div className="mb-6">
        <h4 className="mb-3 text-white font-semibold">Choose your preferred name:</h4>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="orgai"
              name="prolaunch-name"
              value="orgai"
              checked={selectedName === 'orgai'}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="orgai" className="cursor-pointer font-medium text-gray-300">
              ProLaunch OrgAI
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="teamai"
              name="prolaunch-name"
              value="teamai"
              checked={selectedName === 'teamai'}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="teamai" className="cursor-pointer font-medium text-gray-300">
              ProLaunch TeamAI
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="smartoffice"
              name="prolaunch-name"
              value="smartoffice"
              checked={selectedName === 'smartoffice'}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="smartoffice" className="cursor-pointer font-medium text-gray-300">
              ProLaunch SmartOffice
            </label>
          </div>
        </div>
      </div>

      <Link
        href="#coming-soon"
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
      >
        Get Early Access
      </Link>
    </section>
  );
}
