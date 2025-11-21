'use client';

/**
 * Logo Editor Page
 * Edit existing logos with interactive canvas and properties panel
 * Phase 2: Editing & Export
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Download, Undo2, Redo2, Loader2, Sparkles, Grid, Clock } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ai/Toast';
import type { Logo, LogoVersion } from '@kimuntupro/db';
import { saveLogoVersion, getLogoVersions, restoreLogoVersion, deleteLogoVersion } from '@kimuntupro/db';
import type { LogoSpec } from '@kimuntupro/shared';
import LogoCanvas from '../../components/LogoCanvas';
import PropertiesPanel from '../../components/PropertiesPanel';
import ExportDialog from '../../components/ExportDialog';
import RefinementDialog from '../../components/RefinementDialog';
import VariationSelectorDialog from '../../components/VariationSelectorDialog';
import VersionHistoryPanel from '../../components/VersionHistoryPanel';
import { useLogoEditor } from '../../hooks/useLogoEditor';

export default function LogoEditorPage() {
  const params = useParams();
  const router = useRouter();
  const logoId = params.id as string;

  const [logo, setLogo] = useState<Logo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showRefinementDialog, setShowRefinementDialog] = useState(false);
  const [showVariationSelector, setShowVariationSelector] = useState(false);
  const [generatedVariations, setGeneratedVariations] = useState<LogoSpec[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<LogoVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const editor = useLogoEditor();

  // Fetch logo
  useEffect(() => {
    async function fetchLogo() {
      if (!logoId) return;

      try {
        setLoading(true);

        const response = await fetch(`/api/logo/${logoId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Logo not found');
          }
          throw new Error('Failed to load logo');
        }

        const data = await response.json();

        // Convert date strings to Date objects
        const logoData = data.logo;
        if (logoData.createdAt) {
          logoData.createdAt = new Date(logoData.createdAt);
        }
        if (logoData.updatedAt) {
          logoData.updatedAt = new Date(logoData.updatedAt);
        }
        if (logoData.generationMetadata?.generatedAt) {
          logoData.generationMetadata.generatedAt = new Date(
            logoData.generationMetadata.generatedAt
          );
        }

        setLogo(logoData);

        // Load the current spec into editor
        editor.loadSpec(logoData.currentSpec);

        // Fetch version history
        await fetchVersions();
      } catch (err: any) {
        console.error('[LogoEditor] Failed to fetch logo:', err);
        toast.error(err.message || 'Failed to load logo');
        router.push('/dashboard/business/logos');
      } finally {
        setLoading(false);
      }
    }

    fetchLogo();
  }, [logoId]);

  // Fetch version history
  const fetchVersions = async () => {
    if (!logoId) return;

    try {
      setLoadingVersions(true);
      const versionHistory = await getLogoVersions(logoId);
      setVersions(versionHistory);
    } catch (err: any) {
      console.error('[LogoEditor] Failed to fetch versions:', err);
      // Don't show error toast - versions are optional
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user || !logo || !editor.currentSpec) {
      toast.error('Cannot save: missing data');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/logo/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoId: logo.id,
          tenantId: logo.tenantId,
          userId: user.uid,
          businessPlanId: logo.businessPlanId,
          companyName: logo.companyName,
          brief: logo.brief,
          concepts: logo.concepts,
          currentSpec: editor.currentSpec,
          isPrimary: logo.isPrimary,
          generationMetadata: logo.generationMetadata,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save logo');
      }

      toast.success('Logo saved successfully!');

      // Update local state
      setLogo({
        ...logo,
        currentSpec: editor.currentSpec,
        updatedAt: new Date(),
      });
    } catch (err: any) {
      console.error('[LogoEditor] Failed to save logo:', err);
      toast.error(err.message || 'Failed to save logo');
    } finally {
      setSaving(false);
    }
  };

  const handleRefinementComplete = (refinedSpec: LogoSpec, metadata: any) => {
    console.log('[LogoEditor] Refinement complete, loading refined spec');
    editor.loadSpec(refinedSpec);
    toast.success('Logo refined! Remember to save your changes.');
  };

  const handleVariationsComplete = (variations: LogoSpec[], metadata: any) => {
    console.log('[LogoEditor] Variations complete:', variations.length);
    if (variations.length > 0) {
      setGeneratedVariations(variations);
      setShowVariationSelector(true);
      toast.success(`Generated ${variations.length} variations! Choose one to use.`);
    }
  };

  const handleVariationSelect = (variation: LogoSpec) => {
    console.log('[LogoEditor] Loading selected variation');
    editor.loadSpec(variation);
    toast.success('Variation loaded! Remember to save your changes.');
  };

  const handleSaveVersion = async (label?: string) => {
    if (!logoId) return;

    try {
      const versionId = await saveLogoVersion(logoId, label);
      toast.success('Version saved successfully!');
      await fetchVersions();
    } catch (err: any) {
      console.error('[LogoEditor] Failed to save version:', err);
      toast.error(err.message || 'Failed to save version');
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!logoId) return;

    try {
      await restoreLogoVersion(logoId, versionId);

      // Fetch updated logo to get restored spec
      const response = await fetch(`/api/logo/${logoId}`);
      if (!response.ok) throw new Error('Failed to load updated logo');

      const data = await response.json();
      const logoData = data.logo;

      // Update state and editor
      setLogo(logoData);
      editor.loadSpec(logoData.currentSpec);

      toast.success('Version restored! Remember to save to persist changes.');
      await fetchVersions();
    } catch (err: any) {
      console.error('[LogoEditor] Failed to restore version:', err);
      toast.error(err.message || 'Failed to restore version');
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!logoId) return;

    try {
      await deleteLogoVersion(logoId, versionId);
      toast.success('Version deleted');
      await fetchVersions();
    } catch (err: any) {
      console.error('[LogoEditor] Failed to delete version:', err);
      toast.error(err.message || 'Failed to delete version');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!logo || !editor.currentSpec) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Logo not found</h2>
          <p className="text-gray-400 mb-6">
            The logo you're trying to edit doesn't exist or failed to load.
          </p>
          <button
            onClick={() => router.push('/dashboard/business/logos')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Back to Logos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/business/logos')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="h-6 w-px bg-gray-700" />
              <div>
                <h1 className="text-lg font-bold text-white">{logo.companyName}</h1>
                <p className="text-sm text-gray-400">Logo Editor</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Undo/Redo */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={editor.undo}
                  disabled={!editor.canUndo}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={editor.redo}
                  disabled={!editor.canRedo}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>

              {/* Grid Toggle */}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showGrid
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                title="Toggle grid"
              >
                <Grid className="w-4 h-4" />
                Grid
              </button>

              {/* Version History Toggle */}
              <button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showVersionHistory
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                title="Toggle version history"
              >
                <Clock className="w-4 h-4" />
                History
              </button>

              {/* AI Refinement */}
              <button
                onClick={() => setShowRefinementDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI Enhance
              </button>

              {/* Export */}
              <button
                onClick={() => setShowExportDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <LogoCanvas
              spec={editor.currentSpec}
              interactive={true}
              selectedElementId={editor.selectedElementId}
              onElementSelect={editor.setSelectedElementId}
              showGrid={showGrid}
              className="w-[500px] h-[500px]"
            />
          </div>
        </div>

        {/* Properties Panel */}
        {!showVersionHistory && (
          <PropertiesPanel
            spec={editor.currentSpec}
            selectedElementId={editor.selectedElementId}
            onSelectElement={editor.setSelectedElementId}
            onUpdateShape={editor.updateShape}
            onUpdateText={editor.updateText}
            onUpdateCanvas={editor.updateCanvas}
            onDeleteElement={editor.deleteElement}
            onBringToFront={editor.bringToFront}
            onSendToBack={editor.sendToBack}
            onAlign={editor.alignElement}
          />
        )}

        {/* Version History Panel */}
        {showVersionHistory && (
          <div className="w-96">
            <VersionHistoryPanel
              logoId={logoId}
              versions={versions}
              onRestore={handleRestoreVersion}
              onDelete={handleDeleteVersion}
              onSaveVersion={handleSaveVersion}
              isLoadingVersions={loadingVersions}
            />
          </div>
        )}
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        spec={editor.currentSpec}
        logoName={logo.companyName}
      />

      {/* Refinement Dialog */}
      <RefinementDialog
        isOpen={showRefinementDialog}
        onClose={() => setShowRefinementDialog(false)}
        currentSpec={editor.currentSpec}
        companyName={logo.companyName}
        onRefinementComplete={handleRefinementComplete}
        onVariationsComplete={handleVariationsComplete}
      />

      {/* Variation Selector Dialog */}
      <VariationSelectorDialog
        isOpen={showVariationSelector}
        onClose={() => setShowVariationSelector(false)}
        variations={generatedVariations}
        onSelect={handleVariationSelect}
      />
    </div>
  );
}
