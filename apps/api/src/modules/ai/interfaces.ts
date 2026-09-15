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
  generateCommercialContent(analysis: any, title: string, description: string): Promise<any>;
}

export interface AIImageProcessor {
  removeBackground(imageUrl: string): Promise<any>;
  enhanceImage(imageUrl: string): Promise<any>;
}
