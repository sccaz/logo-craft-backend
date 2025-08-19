// pages/api/generate-logo.ts
import type { NextApiRequest, NextApiResponse } from "next";

const VERSION = "strict-logs";
const LEONARDO_BASE = "https://cloud.leonardo.ai/api/rest/v1";

const RAW_ORIGINS =
  process.env.ALLOWED_ORIGINS ||
  process.env.ALLOWED_ORIGIN ||
  "https://lovable.dev,https://*.lovable.dev,https://*.lovable.app,http://localhost:3000";
const ORIGINS = RAW_ORIGINS.split(",").map(s => s.trim()).filter(Boolean);

function matchOrigin(origin?: string): string | null {
  if (!origin) return null;
  try {
    const url = new URL(origin);
    const protoHost = `${url.protocol}//${url.host}`;
    const host = url.host;
    if (ORIGINS.includes(protoHost)) return protoHost;
    for (const rule of ORIGINS) {
      if (rule.startsWith("*.")) {
        const suffix = rule.slice(1);
        if (host.endsWith(suffix) && protoHost.startsWith("https://")) return protoHost;
      }
    }
  } catch {}
  return null;
}
function setCors(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin as string | undefined;
  const allowed = matchOrigin(origin);
  res.setHeader("X-Api-Version", VERSION);
  res.setHeader("X-CORS-Debug-Origin", origin || "none");
  res.setHeader("X-CORS-Debug-Allowed", String(Boolean(allowed)));
  res.setHeader("X-CORS-Debug-List", ORIGINS.join("|"));
  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", allowed);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(req, res);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed", version: VERSION });

  const KEY   = process.env.LEONARDO_API_KEY;
  const MODEL = process.env.LEONARDO_MODEL_ID;

  // 👉 pas de dummy : on dit clairement ce qui manque
  if (!KEY)   return res.status(401).json({ error: "LEONARDO_API_KEY missing", version: VERSION });
  if (!MODEL) return res.status(400).json({ error: "LEONARDO_MODEL_ID missing", version: VERSION });

  try {
    const { prompt, width, height, num_images, negativePrompt, seed } = (req.body ?? {}) as any;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt", version: VERSION });
    }

    const bodyCreate: any = {
      modelId: MODEL,
      prompt,
      negative_prompt:
        typeof negativePrompt === "string"
          ? negativePrompt
          : "text, words, watermark, mockup, photo, photorealistic, gradient, complex background, drop shadow, 3D, blurry",
      width:  Number.isFinite(width)  ? Number(width)  : 1024,
      height: Number.isFinite(height) ? Number(height) : 1024,
      num_images: Number.isFinite(num_images) ? Number(num_images) : 1,
    };
    if (Number.isFinite(seed)) bodyCreate.seed = Number(seed);

    // 1) create
    const create = await fetch(`${LEONARDO_BASE}/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify(bodyCreate),
    });
    const created = await create.json();
    if (!create.ok) {
      return res.status(create.status).json({
        error: "Leonardo create failed",
        version: VERSION,
        debug: { status: create.status, created },
      });
    }

    // direct images ?
    const directImgs = created?.generations_by_pk?.generated_images || created?.generated_images || [];
    const directUrls = directImgs.map((x: any) => x?.url).filter(Boolean);
    if (directUrls.length) return res.status(200).json({ imageUrls: directUrls, version: VERSION, debug: { stage: "direct" } });

    const generationId = created?.sdGenerationJob?.generationId || created?.generationId || created?.id;
    if (!generationId) {
      return res.status(502).json({ error: "No generationId returned", version: VERSION, debug: created });
    }

    // 2) poll
    for (let i = 0; i < 12; i++) { // ~24s
      await sleep(2000);
      const poll = await fetch(`${LEONARDO_BASE}/generations/${generationId}`, {
        headers: { Authorization: `Bearer ${KEY}` },
      });
      const polled = await poll.json();
      if (!poll.ok) {
        return res.status(poll.status).json({
          error: "Leonardo poll failed",
          version: VERSION,
          debug: { status: poll.status, polled },
        });
      }
      const imgs = polled?.generations_by_pk?.generated_images || polled?.generated_images || polled?.images || [];
      const urls = imgs.map((x: any) => x?.url).filter(Boolean);
      if (urls.length) {
        return res.status(200).json({ imageUrls: urls, version: VERSION, debug: { stage: "polled", generationId } });
      }
      const status = polled?.generations_by_pk?.status || polled?.status;
      if (status === "FAILED") {
        return res.status(502).json({ error: "Leonardo status FAILED", version: VERSION, debug: { generationId, polled } });
      }
    }

    return res.status(504).json({ error: "Leonardo timeout (no images)", version: VERSION, debug: { hint: "check credits/model/options" } });
  } catch (e: any) {
    return res.status(500).json({ error: "Server error", version: VERSION, debug: { message: e?.message } });
  }
}
