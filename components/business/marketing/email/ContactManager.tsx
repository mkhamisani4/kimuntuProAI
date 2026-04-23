'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserPlus, Upload, Sparkles, Trash2, Search, RefreshCw } from 'lucide-react';
import type { MarketingSettings } from '@kimuntupro/db';
import { toast } from '@/components/ai/Toast';
import { fetchAuthed } from '@/lib/api/fetchAuthed';

interface ContactManagerProps {
  tenantId: string;
  userId: string;
  settings: MarketingSettings;
}

interface Contact {
  id: string;
  email_address: string;
  full_name: string;
  status: string;
  merge_fields: { FNAME?: string; LNAME?: string };
  tags: { id: number; name: string }[];
}

export default function ContactManager({ tenantId, userId, settings }: ContactManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add form state
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');

  // Segmentation state
  const [segmentGoal, setSegmentGoal] = useState('');
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        tenantId,
        userId,
        offset: String(offset),
        count: '20',
      });

      const response = await fetch(`/api/marketing/email/contacts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch contacts');

      const data = await response.json();
      setContacts(data.data.members || []);
      setTotalItems(data.data.total_items || 0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, userId, offset]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    try {
      const response = await fetchAuthed('/api/marketing/email/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          userId,
          email: newEmail,
          firstName: newFirstName,
          lastName: newLastName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add contact');
      }

      toast.success('Contact added!');
      setNewEmail('');
      setNewFirstName('');
      setNewLastName('');
      setShowAddForm(false);
      loadContacts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add contact');
    }
  };

  const handleDeleteContact = async (email: string) => {
    if (!confirm('Archive this contact?')) return;

    try {
      const response = await fetchAuthed('/api/marketing/email/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, userId, email }),
      });

      if (!response.ok) throw new Error('Failed to archive contact');

      toast.success('Contact archived');
      loadContacts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to archive contact');
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const Papa = (await import('papaparse')).default;
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const contacts = results.data
            .filter((row: any) => row.email || row.Email || row.EMAIL)
            .map((row: any) => ({
              email: row.email || row.Email || row.EMAIL,
              firstName: row.firstName || row.first_name || row.FNAME || row['First Name'] || '',
              lastName: row.lastName || row.last_name || row.LNAME || row['Last Name'] || '',
            }));

          if (contacts.length === 0) {
            toast.error('No valid contacts found in CSV');
            return;
          }

          const toastId = toast.loading(`Importing ${contacts.length} contacts...`);

          const response = await fetchAuthed('/api/marketing/email/contacts/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId, userId, contacts }),
          });

          if (!response.ok) throw new Error('Failed to start import');

          const data = await response.json();
          toast.success(`Import started! Batch ID: ${data.batchId}`, { id: toastId });
          loadContacts();
        },
        error: (err) => {
          toast.error(`CSV parse error: ${err.message}`);
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to process CSV');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAISegment = async () => {
    if (!segmentGoal.trim()) return;
    setIsSegmenting(true);

    try {
      const allTags = contacts.flatMap((c) => (c.tags || []).map((t) => t.name));
      const uniqueTags = [...new Set(allTags)];

      const response = await fetchAuthed('/api/marketing/email/contacts/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          userId,
          goal: segmentGoal,
          contactTags: uniqueTags,
        }),
      });

      if (!response.ok) throw new Error('Failed to create segments');

      const data = await response.json();
      toast.success(`Created ${data.createdSegments.length} segment(s)!`);
      setShowSegmentModal(false);
      setSegmentGoal('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create segments');
    } finally {
      setIsSegmenting(false);
    }
  };

  const filteredContacts = searchTerm
    ? contacts.filter(
        (c) =>
          c.email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : contacts;

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={loadContacts}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSegmentModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI Segment
          </button>
          <div className="relative group">
            <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Import CSV
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
            <div className="absolute top-full mt-1 right-0 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 hidden group-hover:block z-10 shadow-lg">
              CSV should have columns: <strong>email</strong> (required), <strong>first_name</strong>, <strong>last_name</strong>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <form onSubmit={handleAddContact} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">First Name</label>
            <input
              type="text"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
            <input
              type="text"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add
          </button>
        </form>
      )}

      {/* Contacts table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tags</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">Loading contacts...</td>
              </tr>
            ) : filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">No contacts found</td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{contact.email_address}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {[contact.merge_fields?.FNAME, contact.merge_fields?.LNAME].filter(Boolean).join(' ') || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      contact.status === 'subscribed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {(contact.tags || []).map((t) => t.name).join(', ') || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteContact(contact.email_address)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Archive contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalItems > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500">
              Showing {offset + 1}-{Math.min(offset + 20, totalItems)} of {totalItems}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - 20))}
                disabled={offset === 0}
                className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(offset + 20)}
                disabled={offset + 20 >= totalItems}
                className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Segment Modal */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AI Audience Segmentation</h3>
            <p className="text-sm text-gray-500 mb-4">
              Describe your campaign goal and AI will suggest audience segments based on your contacts.
            </p>
            <textarea
              value={segmentGoal}
              onChange={(e) => setSegmentGoal(e.target.value)}
              placeholder="e.g., Promote our new premium subscription to engaged users who haven't upgraded yet"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-24 resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowSegmentModal(false); setSegmentGoal(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAISegment}
                disabled={isSegmenting || !segmentGoal.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {isSegmenting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Segments
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
