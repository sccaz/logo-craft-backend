import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt invalide ou manquant.' });
    }

    return res.status(200).json({
      message: 'Prompt reçu avec succès',
      prompt,
    });
  }

  // Si la méthode n’est pas POST
  res.status(405).json({ error: 'Méthode non autorisée' });
}
