import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.LEONARDO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API Leonardo manquante.' }, { status: 500 });
    }

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt invalide.' }, { status: 400 });
    }

    console.log("✅ Prompt reçu :", prompt);

    // ID du modèle Flux Dev (compatible alchemy/dynamic)
    const modelId = "b2614463-296c-462a-9586-aafdb8f00e36";

    // Requête vers Leonardo pour générer les images
    const generationResponse = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        modelId,
        num_images: 4,
        width: 512,
        height: 512,
        alchemy: true, // Active le mode dynamique
        promptMagic: true,
        guidance_scale: 7,
        num_inference_steps: 25
      })
    });

    const generationData = await generationResponse.json();

    if (!generationResponse.ok || !generationData.sdGenerationJob?.generationId) {
      console.error("🛑 Erreur Leonardo:", generationData);
      return NextResponse.json({ error: "Erreur de génération : " + JSON.stringify(generationData) }, { status: 500 });
    }

    const generationId = generationData.sdGenerationJob.generationId;

    // Attendre quelques secondes que les images soient prêtes
    await new Promise(resolve => setTimeout(resolve, 8000));

    const imagesResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    const imagesData = await imagesResponse.json();

    if (!imagesResponse.ok || !imagesData.generations_by_pk?.generated_images) {
      console.error("🛑 Erreur récupération images:", imagesData);
      return NextResponse.json({ error: "Images non récupérées" }, { status: 500 });
    }

    const imageUrls = imagesData.generations_by_pk.generated_images.map((img: any) => img.url);

    return NextResponse.json({ imageUrls });

  } catch (error: any) {
    console.error("🛑 Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
  }
}
