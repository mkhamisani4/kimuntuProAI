'use client';

/**
 * VersionHistoryPanel Component
 * Displays saved versions of the logo with restore and delete capabilities
 * Phase 3: Feature 4 - Version History
 */

import { useState, useEffect } from 'react';
import { Clock, RotateCcw, Trash2, Tag, Save, X, AlertTriangle } from 'lucide-react';
import type { LogoVersion } from '@kimuntupro/db';
import LogoCanvas from './LogoCanvas';

interface VersionHistoryPanelProps {
  logoId: string;
  versions: LogoVersion[];
  onRestore: (versionId: string) => void;
  onDelete: (versionId: string) => void;
  onSaveVersion: (label?: string) => void;
  isLoadingVersions?: boolean;
}

export default function VersionHistoryPanel({
  logoId,
  versions,
  onRestore,
  onDelete,
  onSaveVersion,
  isLoadingVersions = false,
}: VersionHistoryPanelProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [deleteConfirmVersion, setDeleteConfirmVersion] = useState<LogoVersion | null>(null);

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSaveVersion = () => {
    onSaveVersion(versionLabel.trim() || undefined);
    setVersionLabel('');
    setShowSaveDialog(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Version History</h3>
        </div>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Version
        </button>
      </div>

      {/* Save Version Dialog */}
      {showSaveDialog && (
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Version Label (Optional)
              </label>
              <input
                type="text"
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
                placeholder="e.g., Final draft, Client feedback"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                autoFocus
                maxLength={50}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setVersionLabel('');
                }}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVersion}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Versions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoadingVersions ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-1">No saved versions yet</p>
            <p className="text-xs text-gray-500">
              Save a version to track your design progress
            </p>
          </div>
        ) : (
          versions.map((version, index) => (
            <div
              key={version.versionId}
              className={`group relative rounded-lg overflow-hidden transition-all ${
                selectedVersionId === version.versionId
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'ring-1 ring-gray-700 hover:ring-gray-600'
              }`}
            >
              {/* Version Preview */}
              <button
                onClick={() =>
                  setSelectedVersionId(
                    selectedVersionId === version.versionId ? null : version.versionId
                  )
                }
                className="w-full p-4 aspect-square"
              >
                <LogoCanvas spec={version.spec} className="w-full h-full" />
              </button>

              {/* Version Info */}
              <div className="bg-gray-800 p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    {version.label && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <Tag className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <p className="text-xs font-medium text-white truncate">
                          {version.label}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      {formatDate(version.savedAt)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestore(version.versionId);
                      }}
                      className="p-1.5 bg-gray-700 hover:bg-gray-600 text-blue-400 rounded transition-colors"
                      title="Restore this version"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmVersion(version);
                      }}
                      className="p-1.5 bg-gray-700 hover:bg-gray-600 text-red-400 rounded transition-colors"
                      title="Delete this version"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Version number badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                    Version {versions.length - index}
                  </span>
                </div>
              </div>

              {/* Expanded view indicator */}
              {selectedVersionId === version.versionId && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                  Selected
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer info */}
      {versions.length > 0 && (
        <div className="p-3 border-t border-gray-700 bg-gray-800/50">
          <p className="text-xs text-gray-500 text-center">
            {versions.length} version{versions.length !== 1 ? 's' : ''} saved • Up to 20
            versions kept
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Delete Version?</h2>
                  <p className="text-sm text-gray-400 mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirmVersion(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Version Preview */}
              <div className="rounded-lg overflow-hidden">
                <div className="p-4 aspect-square">
                  <LogoCanvas spec={deleteConfirmVersion.spec} className="w-full h-full" />
                </div>
              </div>

              {/* Version Info */}
              <div className="bg-gray-800 rounded-lg p-4">
                {deleteConfirmVersion.label && (
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-blue-400" />
                    <p className="text-sm font-medium text-white">
                      {deleteConfirmVersion.label}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-400">
                  Saved {formatDate(deleteConfirmVersion.savedAt)}
                </p>
              </div>

              {/* Warning Message */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  Are you sure you want to delete this version? This will permanently remove
                  it from your version history.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-700">
              <button
                onClick={() => setDeleteConfirmVersion(null)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  onDelete(deleteConfirmVersion.versionId);
                  setDeleteConfirmVersion(null);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Delete Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
