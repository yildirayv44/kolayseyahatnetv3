// This endpoint is for consultant comments (user_comments table)
// Redirects to /api/comments/consultant/[id]/like
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Redirect to consultant-specific endpoint
  const url = new URL(request.url);
  url.pathname = `/api/comments/consultant/${id}/like`;
  return NextResponse.redirect(url);
}
