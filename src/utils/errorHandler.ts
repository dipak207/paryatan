import axios from "axios";
import { NextResponse } from "next/server";

export function handleError(error: unknown) {
  console.error("API Error:", error);

  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "External API request failed";

    return NextResponse.json(
      {
        success: false,
        message,
        status,
      },
      {
        status: status >= 400 && status < 600 ? status : 500,
      }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "Unknown server error",
    },
    {
      status: 500,
    }
  );
}
