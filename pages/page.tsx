'use client';
import { useState } from 'react';

export default function Home() {
  const [userPrompt, setUserPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateLogo = async () => {
    setLoading(true);
    setError('');
    setImageUrl('');

    const response = await fetch('/api/generate-logo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userPrompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur reçue :', data);
      setError(data.error || 'Une erreur est survenue.');
    } else {
      setImageUrl(data.imageUrl);
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🎨 Générateur de logo IA</h1>

      <input
        type="text"
        placeholder="Décris ton logo..."
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        style={{ padding: '10px', width: '300px', marginRight: '10px' }}
      />

      <button onClick={generateLogo} disabled={loading}>
        {loading ? 'Génération...' : 'Générer le logo'}
      </button>

      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      {imageUrl && (
        <div style={{ marginTop: '2rem' }}>
          <img src={imageUrl} alt="Logo généré" width={300} />
        </div>
      )}
    </main>
  );
}
