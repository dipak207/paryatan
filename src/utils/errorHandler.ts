import { NextResponse } from "next/server";

export function handleError(error: unknown) {
  if (error instanceof Error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const err = error as { message: string; status?: number };
    return NextResponse.json({ success: false, message: err.message }, { status: err.status || 500 });
  }

  return NextResponse.json({ success: false, message: "Unknown error" }, { status: 500 });
}
