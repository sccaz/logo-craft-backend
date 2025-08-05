import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<Response> {
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
  } catch (error: unknown) {
    console.error("Erreur serveur :", error);
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: "Erreur serveur : " + message }, { status: 500 });
  }
}
