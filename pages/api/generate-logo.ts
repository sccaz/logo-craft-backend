import type { NextApiRequest, NextApiResponse } from "next";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "";
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY || "";
const LEONARDO_BASE = "https://cloud.leonardo.ai/api/rest/v1";

function setCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin || "";
  // vary so caches don’t mess with different origins
  res.setHeader("Vary", "Origin");

  if (origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    // Important: reply to preflight and stop here
    return res.status(204).end();
  }

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

    // TODO: appelez Leonardo ici et renvoyez vos URLs
    // pour tester, renvoyons une image bidon
    return res.status(200).json({ imageUrls: [
      "https://dummyimage.com/512x512/000/fff&text=Logo"
    ]});
  } catch (e: any) {
    console.error("API error:", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
