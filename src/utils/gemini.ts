import type { PlayingCard, Rank, Suit } from '../types/game';

export interface CardDetectionResult {
  cards: PlayingCard[];
  confidence?: string;
  notes?: string;
  rawResponse?: string;
}

const VALID_RANKS: Set<Rank> = new Set(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']);
const VALID_SUITS: Set<Suit> = new Set(['♠', '♥', '♦', '♣']);

function normalizeRank(rawRank: string): Rank {
  const clean = rawRank.trim().toUpperCase();
  if (clean === '1' || clean === 'ACE') return 'A';
  if (clean === 'JACK') return 'J';
  if (clean === 'QUEEN') return 'Q';
  if (clean === 'KING') return 'K';
  if (clean === 'T') return '10';
  if (VALID_RANKS.has(clean as Rank)) return clean as Rank;
  return 'A';
}

function normalizeSuit(rawSuit: string): Suit {
  const clean = rawSuit.trim().toUpperCase();
  if (clean === '♠' || clean === 'S' || clean.includes('SPADE')) return '♠';
  if (clean === '♥' || clean === 'H' || clean.includes('HEART')) return '♥';
  if (clean === '♦' || clean === 'D' || clean.includes('DIAMOND')) return '♦';
  if (clean === '♣' || clean === 'C' || clean.includes('CLUB')) return '♣';
  if (VALID_SUITS.has(clean as Suit)) return clean as Suit;
  return '♠';
}

/**
 * Calls Gemini Multimodal Vision API using Google's latest high-speed, free-tier Flash models:
 * gemini-3.6-flash with automatic fallback to gemini-3.5-flash and gemini-3.5-flash-lite.
 */
export async function detectCardsWithGemini(
  base64Image: string,
  apiKey: string,
  mimeType: string = 'image/jpeg'
): Promise<CardDetectionResult> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('No Gemini API key provided. Please enter your API key in Settings.');
  }

  // Strip data URL header if present
  const base64Data = base64Image.includes('base64,')
    ? base64Image.split('base64,')[1]
    : base64Image;

  const promptText = `
You are an expert playing card detection AI for the card game "It's a 9 Thing!".
Examine the image showing a player's hand laid out or held.
Detect every distinct playing card visible in the image.
The player is holding/laying out their losing hand of 9 cards.
Identify the Rank (A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K) and Suit (♠, ♥, ♦, ♣) of each card.

Return a strictly valid JSON object with the following structure:
{
  "cards": [
    { "rank": "K", "suit": "♠" },
    { "rank": "10", "suit": "♦" }
  ],
  "confidence": "high",
  "notes": "9 cards clearly identified"
}
`;

  const payload = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.1,
    },
  };

  // Models to try in order of preference (latest Flash tier)
  const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
  let lastErrorMsg = '';

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      apiKey.trim()
    )}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMsg = `Gemini API (${model}) error: ${response.status} ${response.statusText}`;
        try {
          const parsed = JSON.parse(errorBody);
          if (parsed?.error?.message) {
            errorMsg = parsed.error.message;
          }
        } catch {
          // ignore json parse error
        }
        lastErrorMsg = errorMsg;
        // Try fallback if model not found or temporarily unavailable
        if (response.status === 404 || response.status === 503) {
          continue;
        }
        throw new Error(errorMsg);
      }

      const json = await response.json();
      const textContent = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error('Gemini API did not return any candidate content.');
      }

      const parsedData = JSON.parse(textContent);
      const rawCards = Array.isArray(parsedData?.cards) ? parsedData.cards : [];

      const cards: PlayingCard[] = rawCards.map((c: any, index: number) => ({
        id: `card-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        rank: normalizeRank(String(c.rank || 'A')),
        suit: normalizeSuit(String(c.suit || '♠')),
      }));

      return {
        cards,
        confidence: parsedData.confidence || 'medium',
        notes: parsedData.notes || '',
        rawResponse: textContent,
      };
    } catch (err: any) {
      if (candidateModels.indexOf(model) === candidateModels.length - 1) {
        throw new Error(err.message || lastErrorMsg || 'Failed to scan cards with Gemini.');
      }
    }
  }

  throw new Error(lastErrorMsg || 'Failed to scan hand with Gemini Vision.');
}
