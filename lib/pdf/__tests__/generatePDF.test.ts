import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePDF, type PDFMetadata } from '../generatePDF';
import jsPDF from 'jspdf';

// Mock jsPDF
vi.mock('jspdf', () => {
  const mockDoc = {
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 210),
        getHeight: vi.fn(() => 297),
      },
    },
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    setDrawColor: vi.fn(),
    text: vi.fn(),
    line: vi.fn(),
    splitTextToSize: vi.fn((text: string, width: number) => [text]),
    addPage: vi.fn(),
    getNumberOfPages: vi.fn(() => 2),
    setPage: vi.fn(),
    getTextWidth: vi.fn((text: string) => text.length * 2),
    save: vi.fn(),
  };

  return {
    default: vi.fn(() => mockDoc),
  };
});

// Mock toast
vi.mock('@/components/ai/Toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('generatePDF', () => {
  const mockSections = {
    'Executive Summary': 'This is the executive summary content.',
    'Market Analysis': 'This is the market analysis content.',
    'Financial Projections': 'Revenue projections for 12 months.',
  };

  const mockMetadata: PDFMetadata = {
    assistantType: 'streamlined_plan',
    model: 'gpt-4o-mini',
    generatedAt: new Date('2025-01-15T10:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should create a new jsPDF document', () => {
    generatePDF(mockSections, mockMetadata);

    expect(jsPDF).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  });

  it('should add title and metadata to PDF', () => {
    generatePDF(mockSections, mockMetadata);

    const mockDoc = (jsPDF as any).mock.results[0].value;

    // Check that text() was called multiple times (for title, metadata, sections, footer)
    expect(mockDoc.text).toHaveBeenCalled();

    // Check that text method received content about the assistant and model
    const allTextCalls = mockDoc.text.mock.calls.map((call: any[]) => JSON.stringify(call));
    const allCallsString = allTextCalls.join(' ');

    expect(allCallsString).toContain('KimuntuPro');
    expect(allCallsString).toContain('Streamlined Business Plan');
    expect(allCallsString).toContain('gpt-4o-mini');
  });

  it('should add all sections to PDF', () => {
    generatePDF(mockSections, mockMetadata);

    const mockDoc = (jsPDF as any).mock.results[0].value;

    // Check that section titles and content are added
    const allTextCalls = mockDoc.text.mock.calls.map((call: any[]) => JSON.stringify(call));
    const allCallsString = allTextCalls.join(' ');

    expect(allCallsString).toContain('Executive Summary');
    expect(allCallsString).toContain('This is the executive summary content.');
    expect(allCallsString).toContain('Market Analysis');
    expect(allCallsString).toContain('Financial Projections');
  });

  it('should add footer to all pages', () => {
    generatePDF(mockSections, mockMetadata);

    const mockDoc = (jsPDF as any).mock.results[0].value;

    // Check that getNumberOfPages was called
    expect(mockDoc.getNumberOfPages).toHaveBeenCalled();

    // Check that setPage was called for each page
    expect(mockDoc.setPage).toHaveBeenCalledWith(1);
    expect(mockDoc.setPage).toHaveBeenCalledWith(2);

    // Check footer text contains page numbers
    const footerCalls = mockDoc.text.mock.calls.filter((call: any) =>
      typeof call[0] === 'string' && call[0].includes('Page')
    );
    expect(footerCalls.length).toBeGreaterThan(0);
  });

  it('should save PDF with correct filename format', () => {
    generatePDF(mockSections, mockMetadata);

    const mockDoc = (jsPDF as any).mock.results[0].value;

    expect(mockDoc.save).toHaveBeenCalledTimes(1);

    const filename = mockDoc.save.mock.calls[0][0];

    // Check filename format: KimuntuPro_<type>_<date>.pdf
    expect(filename).toMatch(/^KimuntuPro_streamlined_plan_\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  it('should show success toast on successful PDF generation', async () => {
    const { toast } = await import('@/components/ai/Toast');

    generatePDF(mockSections, mockMetadata);

    expect(toast.success).toHaveBeenCalledWith('✓ PDF downloaded');
  });

  it('should show error toast on PDF generation failure', async () => {
    const { toast } = await import('@/components/ai/Toast');

    // Mock jsPDF constructor to throw error
    (jsPDF as any).mockImplementationOnce(() => {
      throw new Error('PDF generation error');
    });

    generatePDF(mockSections, mockMetadata);

    expect(toast.error).toHaveBeenCalledWith('Failed to generate PDF');
    expect(console.error).toHaveBeenCalled();
  });

  it('should use current date if generatedAt is not provided', () => {
    const metadataWithoutDate: PDFMetadata = {
      assistantType: 'market_analysis',
      model: 'gpt-4o-mini',
    };

    generatePDF(mockSections, metadataWithoutDate);

    const mockDoc = (jsPDF as any).mock.results[0].value;

    // Check that a date was added (current date)
    const generatedCalls = mockDoc.text.mock.calls.filter((call: any) =>
      typeof call[0] === 'string' && call[0].includes('Generated:')
    );
    expect(generatedCalls.length).toBeGreaterThan(0);
  });

  it('should format different assistant types correctly', () => {
    const execSummaryMetadata: PDFMetadata = {
      assistantType: 'exec_summary',
      model: 'gpt-4o-mini',
    };

    generatePDF(mockSections, execSummaryMetadata);

    const mockDoc = (jsPDF as any).mock.results[0].value;

    expect(mockDoc.text).toHaveBeenCalledWith('Assistant: Executive Summary + Financials', expect.any(Number), expect.any(Number));
  });

  it('should handle empty sections', () => {
    generatePDF({}, mockMetadata);

    const mockDoc = (jsPDF as any).mock.results[0].value;

    // Should still create PDF with title and metadata
    expect(mockDoc.save).toHaveBeenCalled();
  });

  it('should use emerald color for title', () => {
    generatePDF(mockSections, mockMetadata);

    const mockDoc = (jsPDF as any).mock.results[0].value;

    // Check that emerald color (16, 185, 129) is set
    expect(mockDoc.setTextColor).toHaveBeenCalledWith(16, 185, 129);
  });

  it('should split long text into multiple lines', () => {
    const longSections = {
      'Long Section': 'A'.repeat(1000),
    };

    generatePDF(longSections, mockMetadata);

    const mockDoc = (jsPDF as any).mock.results[0].value;

    // Check that splitTextToSize was called
    expect(mockDoc.splitTextToSize).toHaveBeenCalled();
  });
});
