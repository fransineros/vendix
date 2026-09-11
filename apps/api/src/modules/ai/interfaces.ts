export interface AIProductAnalyzer {
  analyze(imageUrl: string): Promise<{
    category: string;
    brand?: string;
    colors: string[];
    attributes: Record<string, string>;
    confidence: number;
  }>;
}

export interface AIContentGenerator {
  generateTitle(analysis: any): Promise<string>;
  generateDescription(analysis: any, title: string): Promise<string>;
  generateHashtags(analysis: any, title: string): Promise<string[]>;
  generateCommercialContent(analysis: any, title: string, description: string): Promise<string>;
}

export interface AIImageProcessor {
  removeBackground(imageUrl: string): Promise<{ processedUrl: string; thumbnailUrl: string }>;
  enhanceImage(imageUrl: string): Promise<{ processedUrl: string }>;
}