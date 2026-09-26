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

  // Build list of candidate URLs to handle Cloudinary raw vs image path variations
  const candidates: string[] = [targetUrl];

  if (targetUrl.includes("res.cloudinary.com")) {
    if (targetUrl.includes("/image/upload/")) {
      candidates.push(targetUrl.replace("/image/upload/", "/raw/upload/"));
    } else if (targetUrl.includes("/raw/upload/")) {
      candidates.push(targetUrl.replace("/raw/upload/", "/image/upload/"));
    }

    const cleanTarget = targetUrl.split("?")[0].split("#")[0];
    const extMatch = cleanTarget.match(/\.([a-z0-9]+)$/i);
    if (!extMatch) {
      ["pdf", "xlsx", "xls", "csv", "docx", "doc"].forEach((ext) => {
        candidates.push(`${targetUrl}.${ext}`);
        if (targetUrl.includes("/image/upload/")) {
          candidates.push(targetUrl.replace("/image/upload/", "/raw/upload/") + `.${ext}`);
        }
      });
    }
  }

  try {
    let res: Response | null = null;

    for (const urlToTry of candidates) {
      try {
        const r = await fetch(urlToTry, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        if (r.ok) {
          res = r;
          break;
        }
      } catch {
        // Try next candidate URL
      }
    }

    if (!res || !res.ok) {
      console.warn(`Document Proxy remote fetch failed for target: ${targetUrl}`);
      return new NextResponse(`Failed to fetch file from remote server: ${res ? res.status : 404}`, {
        status: res ? res.status : 404,
      });
    }

    const rawType = res.headers.get("content-type") || "application/octet-stream";
    const contentType = rawType.includes("text/html") ? "application/octet-stream" : rawType;
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
    console.error("Document Proxy Internal Error for target:", targetUrl, err);
    return new NextResponse(`Document Proxy Error: ${err?.message || err}`, { status: 500 });
  }
}
