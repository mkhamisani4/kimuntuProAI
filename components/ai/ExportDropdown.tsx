'use client';

/**
 * ExportDropdown Component
 * Dropdown menu for exporting assistant results in various formats
 * Uses Headless UI for accessibility and keyboard navigation
 */

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { copyAsMarkdown, copyAsPlainText, copyAsHTML } from '@/lib/clipboard/copy';
import { generatePDF, type PDFMetadata } from '@/lib/pdf/generatePDF';

interface ExportDropdownProps {
  sections: Record<string, string>;
  metadata: PDFMetadata;
}

export default function ExportDropdown({ sections, metadata }: ExportDropdownProps) {
  const handleCopyMarkdown = () => {
    copyAsMarkdown(sections);
  };

  const handleCopyPlainText = () => {
    copyAsPlainText(sections);
  };

  const handleCopyHTML = async () => {
    await copyAsHTML(sections);
  };

  const handleDownloadPDF = () => {
    generatePDF(sections, metadata);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-sm">
          Export
          <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleCopyMarkdown}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                  data-testid="export-markdown"
                >
                  <ClipboardDocumentIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-emerald-500"
                    aria-hidden="true"
                  />
                  Copy as Markdown
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleCopyPlainText}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                  data-testid="export-plain-text"
                >
                  <DocumentTextIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-emerald-500"
                    aria-hidden="true"
                  />
                  Copy as Plain Text
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleCopyHTML}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                  data-testid="export-html"
                >
                  <CodeBracketIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-emerald-500"
                    aria-hidden="true"
                  />
                  Copy as HTML
                </button>
              )}
            </Menu.Item>

            <div className="border-t border-gray-100" />

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleDownloadPDF}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                  data-testid="export-pdf"
                >
                  <ArrowDownTrayIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-emerald-500"
                    aria-hidden="true"
                  />
                  Download PDF
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
