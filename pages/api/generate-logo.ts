import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt manquant' });
  }

  // Remplacer ceci par ton appel réel à l'API Leonardo AI
  const imageUrl = `https://dummyimage.com/600x400/000/fff&text=${encodeURIComponent(prompt)}`;

  res.status(200).json({ imageUrl });
}
