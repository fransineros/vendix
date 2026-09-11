import { AIProductAnalyzer, AIContentGenerator, AIImageProcessor } from '../interfaces';

export class OpenAIAnalyzer implements AIProductAnalyzer {
  async analyze(imageUrl: string) {
    // TODO: implementar llamada real a GPT-4o vision
    // const response = await openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: "user", content: [{ type: "text", text: "Analiza este producto..." }, { type: "image_url", image_url: { url: imageUrl } }] }] })
    throw new Error('OpenAI provider not configured - using mock fallback');
  }
}

export class OpenAIContentGenerator implements AIContentGenerator {
  async generateTitle(analysis: any) { throw new Error('Not configured'); }
  async generateDescription(analysis: any, title: string) { throw new Error('Not configured'); }
  async generateHashtags(analysis: any, title: string) { throw new Error('Not configured'); }
  async generateCommercialContent(analysis: any, title: string, description: string) { throw new Error('Not configured'); }
}

export class OpenAIImageProcessor implements AIImageProcessor {
  async removeBackground(imageUrl: string) { throw new Error('Not configured'); }
  async enhanceImage(imageUrl: string) { throw new Error('Not configured'); }
}