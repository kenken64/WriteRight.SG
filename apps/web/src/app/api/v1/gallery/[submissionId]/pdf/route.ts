import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { PDFDocument } from "pdf-lib";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

const PDF_STORAGE_DIR = process.env.PDF_STORAGE_DIR || "/data/gallery-pdfs";

function detectFileFormat(bytes: Uint8Array): "jpeg" | "png" | "pdf" | null {
  // JPEG: starts with FF D8
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
  // PNG: starts with 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  // PDF: starts with %PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "pdf";
  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const { submissionId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: submission, error } = await supabase
    .from("submissions")
    .select("gallery_pdf_ref")
    .eq("id", submissionId)
    .single();

  if (error || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (!submission.gallery_pdf_ref) {
    return NextResponse.json({ error: "No PDF generated yet" }, { status: 404 });
  }

  // Read PDF from Railway volume
  const filePath = path.join(PDF_STORAGE_DIR, submission.gallery_pdf_ref);
  try {
    const pdfBuffer = await readFile(filePath);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="essay-${submissionId}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "PDF file not found on disk" }, { status: 404 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const { submissionId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch submission (RLS enforces access)
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("id, image_refs, gallery_pdf_ref")
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (!submission.image_refs || submission.image_refs.length === 0) {
    return NextResponse.json({ error: "No images to convert" }, { status: 400 });
  }

  // If already generated, read from disk and return
  if (submission.gallery_pdf_ref) {
    const filePath = path.join(PDF_STORAGE_DIR, submission.gallery_pdf_ref);
    try {
      const pdfBuffer = await readFile(filePath);
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="essay-${submissionId}.pdf"`,
        },
      });
    } catch {
      // File missing on disk — regenerate below
    }
  }

  const admin = createAdminSupabaseClient();

  // Download images — try submissions bucket first, fall back to ocr-images
  const pdfDoc = await PDFDocument.create();
  const errors: string[] = [];

  for (const ref of submission.image_refs) {
    // Try primary bucket
    let fileData: Blob | null = null;

    const { data: primaryData, error: primaryError } = await admin.storage
      .from("submissions")
      .download(ref);

    if (primaryError || !primaryData) {
      // Fallback: try ocr-images bucket with reconstructed path
      const ocrPath = `${submissionId}/${ref.split("/").pop()}`;
      const { data: fallbackData, error: fallbackError } = await admin.storage
        .from("ocr-images")
        .download(ocrPath);

      if (fallbackError || !fallbackData) {
        const msg = `Failed to download ${ref} from both buckets: submissions(${primaryError?.message}), ocr-images(${fallbackError?.message})`;
        console.error(`[gallery-pdf] ${msg}`);
        errors.push(msg);
        continue;
      }
      fileData = fallbackData;
    } else {
      fileData = primaryData;
    }

    const bytes = new Uint8Array(await fileData.arrayBuffer());
    const format = detectFileFormat(bytes);

    if (format === "pdf") {
      // Merge pages from existing PDF
      try {
        const srcPdf = await PDFDocument.load(bytes);
        const pageIndices = srcPdf.getPageIndices();
        const copiedPages = await pdfDoc.copyPages(srcPdf, pageIndices);
        for (const copiedPage of copiedPages) {
          pdfDoc.addPage(copiedPage);
        }
      } catch (e) {
        console.warn(`Failed to merge PDF ${ref}:`, e);
      }
      continue;
    }

    let image;
    if (format === "jpeg") {
      image = await pdfDoc.embedJpg(bytes);
    } else if (format === "png") {
      image = await pdfDoc.embedPng(bytes);
    } else {
      console.warn(`Skipping unsupported file format for ${ref}`);
      continue;
    }

    // Scale image to fit A4 while maintaining aspect ratio
    const imgAspect = image.width / image.height;
    const a4Aspect = A4_WIDTH / A4_HEIGHT;

    let pageWidth: number;
    let pageHeight: number;

    if (imgAspect > a4Aspect) {
      pageWidth = A4_WIDTH;
      pageHeight = A4_WIDTH / imgAspect;
    } else {
      pageHeight = A4_HEIGHT;
      pageWidth = A4_HEIGHT * imgAspect;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }

  if (pdfDoc.getPageCount() === 0) {
    console.error(`[gallery-pdf] No pages generated for ${submissionId}. image_refs: ${JSON.stringify(submission.image_refs)}. Errors: ${errors.join("; ")}`);
    return NextResponse.json(
      { error: "Could not process any images", details: errors },
      { status: 400 },
    );
  }

  const pdfBytes = await pdfDoc.save();
  const storagePath = `${submissionId}/essay.pdf`;
  const filePath = path.join(PDF_STORAGE_DIR, storagePath);

  // Write PDF to Railway volume
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, pdfBytes);

  // Update submission with PDF reference
  const { error: updateError } = await admin
    .from("submissions")
    .update({ gallery_pdf_ref: storagePath })
    .eq("id", submissionId);

  if (updateError) {
    return NextResponse.json({ error: `Failed to update submission: ${updateError.message}` }, { status: 500 });
  }

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="essay-${submissionId}.pdf"`,
    },
  });
}
