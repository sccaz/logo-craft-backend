import { NextResponse } from "next/server";

type GeneratedImage = {
  url: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    const imagesResponse = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        modelId: "b2614463-296c-462a-9586-aafdb8f00e36",
        width: 512,
        height: 512,
        num_images: 1,
        promptMagic: true,
      }),
    });

    const imagesData = await imagesResponse.json();

    if (!imagesResponse.ok || !imagesData.generations_by_pk?.generated_images) {
      console.error("❌ Erreur récupération images :", imagesData);
      return NextResponse.json({ error: "Images non récupérées" }, { status: 500 });
    }

    const imageUrls = imagesData.generations_by_pk.generated_images.map(
      (img: GeneratedImage) => img.url
    );

    return NextResponse.json({ imageUrls });
  } catch (error: unknown) {
    console.error("❌ Erreur serveur :", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: "Erreur serveur : " + message }, { status: 500 });
  }
}
