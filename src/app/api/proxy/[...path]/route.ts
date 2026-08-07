import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:4000/api";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "super-secret-admin-key";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BACKEND_API_URL}/${path.join("/")}${req.nextUrl.search}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": ADMIN_API_KEY,
      },
    });

    // Les pièces jointes des sinistres (photos, notes vocales) ne sont pas du
    // JSON : on relaie le flux binaire tel quel plutôt que de le perdre dans un
    // res.json(). La clé d'API reste côté serveur.
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const body = await res.arrayBuffer();
      return new NextResponse(body, {
        status: res.status,
        headers: {
          "Content-Type": contentType || "application/octet-stream",
          "Cache-Control": "private, max-age=300",
        },
      });
    }

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BACKEND_API_URL}/${path.join("/")}${req.nextUrl.search}`;
  const body = await req.text();
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": ADMIN_API_KEY,
        "Content-Type": req.headers.get("Content-Type") || "application/json",
      },
      body: body || undefined,
    });
    
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BACKEND_API_URL}/${path.join("/")}${req.nextUrl.search}`;
  const body = await req.text();
  
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "x-api-key": ADMIN_API_KEY,
        "Content-Type": req.headers.get("Content-Type") || "application/json",
      },
      body: body || undefined,
    });
    
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
