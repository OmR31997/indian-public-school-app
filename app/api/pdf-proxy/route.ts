import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Extract full url parameter cleanly without truncating at unencoded '&'
  const fullReqUrl = request.url;
  const match = fullReqUrl.match(/[?&]url=([^&]+.*)/);
  let rawUrl = match ? decodeURIComponent(match[1]) : new URL(fullReqUrl).searchParams.get("url");

  if (!rawUrl || !rawUrl.trim()) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let targetUrl = rawUrl.trim();

  // If relative URL, resolve against current origin
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    const origin = request.nextUrl.origin;
    targetUrl = `${origin}${targetUrl.startsWith("/") ? "" : "/"}${targetUrl}`;
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.warn(`PDF Proxy remote fetch HTTP status ${res.status} for URL: ${targetUrl}`);
      return new NextResponse(`Failed to fetch file from remote server: ${res.status} ${res.statusText}`, {
        status: res.status,
      });
    }

    const rawType = res.headers.get("content-type") || "application/pdf";
    const contentType =
      rawType.includes("octet-stream") || rawType.includes("text/plain")
        ? "application/pdf"
        : rawType;

    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("PDF Proxy Internal Error for target:", targetUrl, err);
    return new NextResponse(`PDF Proxy Error: ${err?.message || err}`, { status: 500 });
  }
}
