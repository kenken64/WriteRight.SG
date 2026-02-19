'use client';

import { useState } from 'react';
import { Download, Loader2, FileDown } from 'lucide-react';
import { useGenerateGalleryPdf } from '@/lib/api/client';

interface PdfDownloadButtonProps {
  submissionId: string;
  imageRefs: string[] | null;
  galleryPdfRef: string | null;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const NON_IMAGE_EXTS = new Set(['pdf', 'doc', 'docx']);

function hasOnlyNonImageFiles(refs: string[]): boolean {
  return refs.every((ref) => {
    const ext = ref.split('.').pop()?.toLowerCase() ?? '';
    return NON_IMAGE_EXTS.has(ext);
  });
}

export function PdfDownloadButton({ submissionId, imageRefs, galleryPdfRef }: PdfDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const generatePdf = useGenerateGalleryPdf();

  // Hide if no images, or if all files are already PDFs/docs (no point generating a PDF)
  if (!imageRefs || imageRefs.length === 0) return null;
  if (!galleryPdfRef && hasOnlyNonImageFiles(imageRefs)) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const filename = `essay-${submissionId}.pdf`;

    if (galleryPdfRef) {
      // PDF already exists — fetch binary via GET
      setDownloading(true);
      try {
        const res = await fetch(`/api/v1/gallery/${submissionId}/pdf`);
        if (!res.ok) return;
        const blob = await res.blob();
        triggerBlobDownload(blob, filename);
      } finally {
        setDownloading(false);
      }
    } else {
      // Generate PDF via POST — response is now a PDF blob
      generatePdf.mutate(submissionId, {
        onSuccess: (blob) => {
          triggerBlobDownload(blob, filename);
        },
      });
    }
  };

  const generating = generatePdf.isPending;
  const isLoading = generating || downloading;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : galleryPdfRef ? (
        <Download className="h-3.5 w-3.5" />
      ) : (
        <FileDown className="h-3.5 w-3.5" />
      )}
      {isLoading ? 'Processing...' : galleryPdfRef ? 'Download PDF' : 'Generate PDF'}
    </button>
  );
}
