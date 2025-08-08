// pages/api/generate-logo.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Autorisation CORS pour Lovable
  res.setHeader("Access-Control-Allow-Origin", "*"); // Tu peux remplacer * par "https://tondomaine.lovableproject.com" pour plus de sécurité
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Gérer la requête OPTIONS (pré-vol)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Ensuite ton code actuel :
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt invalide" });
  }

  // Ici tu fais appel à Leonardo + return des images
  return res.status(200).json({ imageUrls: ["https://dummyimage.com/300x300/000/fff&text=Logo"] });
}
