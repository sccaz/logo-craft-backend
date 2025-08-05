// app/api/generate-logo/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const prompt = body.prompt as string;

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
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Erreur serveur : " + message },
      { status: 500 }
    );
  }
}

// 👇 ajoute cette fonction pour forcer Next.js à reconnaître la route
export async function GET() {
  return NextResponse.json({ status: "OK" });
}
