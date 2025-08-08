// pages/api/generate-logo.ts
import type { NextApiRequest, NextApiResponse } from "next";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://<ton-sous-domaine>.lovableproject.com";
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY!;
const LEONARDO_BASE = "https://cloud.leonardo.ai/api/rest/v1";

function setCors(res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    if (!LEONARDO_API_KEY) {
      return res.status(500).json({ error: "LEONARDO_API_KEY manquante" });
    }

    const { prompt } = req.body as { prompt?: string };
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt invalide" });
    }

    // 1) Crée la génération
    const create = await fetch(`${LEONARDO_BASE}/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        modelId: "e316348f-...remplace_avec_un_model_id_valide...", // <- mettre un modelId Leonardo valide
        width: 1024,
        height: 1024,
        num_images: 4,
        guidance_scale: 7,
      }),
    });

    if (!create.ok) {
      const text = await create.text();
      return res.status(create.status).json({ error: "Erreur Leonardo (create)", details: text });
    }

    const created = await create.json();
    const generationId = created?.sdGenerationJob?.generationId || created?.generationId;
    if (!generationId) {
      return res.status(500).json({ error: "Impossible de récupérer generationId" });
    }

    // 2) Poll jusqu’à ce que ce soit prêt
    const started = Date.now();
    const TIMEOUT_MS = 60_000; // 60s
    let images: string[] = [];

    while (Date.now() - started < TIMEOUT_MS) {
      await new Promise((r) => setTimeout(r, 1500));

      const statusRes = await fetch(`${LEONARDO_BASE}/generations/${generationId}`, {
        headers: { Authorization: `Bearer ${LEONARDO_API_KEY}` },
      });

      if (!statusRes.ok) continue;

      const statusJson = await statusRes.json();
      const gens = statusJson?.generations_by_pk || statusJson?.generation;

      // Leonardo renvoie souvent generated_images: [{ url: "..."}]
      const doneImages: string[] =
        gens?.generated_images?.map((i: any) => i?.url).filter(Boolean) || [];

      if (doneImages.length > 0) {
        images = doneImages;
        break;
      }
    }

    if (images.length === 0) {
      return res.status(200).json({ imageUrls: [] }); // Le front gérera "aucun logo"
    }

    return res.status(200).json({ imageUrls: images });
  } catch (err: any) {
    console.error("Erreur API:", err);
    return res.status(500).json({ error: "Erreur serveur", details: err?.message || String(err) });
  }
}
