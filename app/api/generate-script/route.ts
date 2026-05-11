import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { niche, promotion, product, city } = await request.json();

    if (!niche || !promotion) {
      return NextResponse.json({ error: 'Nicho e promoção são obrigatórios.' }, { status: 400 });
    }

    const prompt = `Você é um redator especialista em spots publicitários brasileiros de rádio e TV.
Crie um roteiro comercial animado e persuasivo de aproximadamente 60 palavras para:

Negócio/Nicho: ${niche}
Promoção/Oferta: ${promotion}${product ? `\nProduto: ${product}` : ''}${city ? `\nCidade: ${city}` : ''}

Estrutura obrigatória:
1. Abertura chamativa e impactante (1-2 linhas)
2. Corpo com os benefícios e a oferta (2-3 linhas)
3. CTA final com urgência (1 linha)

Use linguagem comercial brasileira vibrante, direta e persuasiva. Retorne APENAS o roteiro, sem explicações, títulos ou formatação extra.`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ script: text });
  } catch (err) {
    console.error('Script generation error:', err);
    return NextResponse.json({ error: 'Erro ao gerar roteiro. Configure ANTHROPIC_API_KEY.' }, { status: 500 });
  }
}
