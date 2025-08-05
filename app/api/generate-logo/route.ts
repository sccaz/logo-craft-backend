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

    // Exemple simple de réponse — tu mettras ta logique de génération ici
    return NextResponse.json({
      message: "Prompt reçu avec succès",
      prompt,
    });
  } catch (error: any) {
    console.error("Erreur serveur :", error);
    return NextResponse.json(
      { error: "Erreur serveur : " + error.message },
      { status: 500 }
    );
  }
}
