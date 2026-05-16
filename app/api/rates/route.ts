import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "USD";
  const to = searchParams.get("to") || "EUR,GBP,JPY,CAD,AUD";

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`, {
      next: { revalidate: 3600 } // Cache rates for 1 hour to stay fast and avoid rate limits
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch remote rates" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}