import { AIProductAnalyzer, AIContentGenerator, AIImageProcessor } from './interfaces';
import { MockAnalyzer, MockContentGenerator, MockImageProcessor } from './providers/mock.provider';
import { OpenAIAnalyzer, OpenAIContentGenerator, OpenAIImageProcessor } from './providers/openai.provider';

export class AIFactory {
  static createAnalyzer(provider: string): AIProductAnalyzer {
    switch(provider) {
      case 'openai': return new OpenAIAnalyzer();
      case 'mock':
      default: return new MockAnalyzer();
    }
  }
  static createContentGenerator(provider: string): AIContentGenerator {
    switch(provider) {
      case 'openai': return new OpenAIContentGenerator();
      case 'mock':
      default: return new MockContentGenerator();
    }
  }
  static createImageProcessor(provider: string): AIImageProcessor {
    switch(provider) {
      case 'openai': return new OpenAIImageProcessor();
      case 'mock':
      default: return new MockImageProcessor();
    }
  }
}