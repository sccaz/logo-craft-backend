// app/api/generate-logo/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt: string = body.prompt;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt invalide ou manquant." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Prompt reçu avec succès",
      prompt,
    });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "OK" });
}
