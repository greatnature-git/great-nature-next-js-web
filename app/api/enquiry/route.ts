import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/enquiry-schema";
import { appendEnquiryRow } from "@/lib/google-sheets";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, phone, email, location, budget, message } = parsed.data;
  const receivedAt = new Date().toISOString();

  try {
    const wrote = await appendEnquiryRow([receivedAt, name, phone, email, location ?? "", budget ?? "", message ?? ""]);
    if (!wrote) {
      console.warn("[enquiry] Google Sheets not configured; lead was not persisted to the sheet.");
    }
  } catch (error) {
    console.error("[enquiry] failed to write lead to Google Sheets:", error);
  }

  return NextResponse.json({ ok: true });
}
