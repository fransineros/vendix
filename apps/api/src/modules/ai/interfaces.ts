export interface AIProductAnalyzer {
  analyze(imageUrl: string): Promise<any>;
}

export interface AIContentGenerator {
  generateTitle(analysis: any): Promise<any>;
  generateDescription(analysis: any, title: string): Promise<any>;
  generateHashtags(analysis: any, title: string): Promise<any>;
  generateCommercialContent(analysis: any, title: string, description: string): Promise<any>;
}

export interface AIImageProcessor {
  removeBackground(imageUrl: string): Promise<any>;
  enhanceImage(imageUrl: string): Promise<any>;
}
