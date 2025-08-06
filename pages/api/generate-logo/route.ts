import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt invalide ou manquant." }, { status: 400 });
  }

  return NextResponse.json({ message: "Prompt reçu avec succès", prompt });
}

export async function GET() {
  return NextResponse.json({ status: "OK" });
}
