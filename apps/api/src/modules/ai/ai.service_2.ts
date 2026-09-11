import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { AIFactory } from './ai.factory';
import { ProductsService } from '../products/products.service';

@Injectable()
export class AiService {
  private provider: string;
  constructor(private prisma: PrismaService, private credits: CreditsService, private products: ProductsService) {
    this.provider = process.env.AI_PROVIDER || 'mock';
  }

  private getCost(type: string): number {
    const map: any = { ANALYZE: 1, DESCRIPTION: 1, HASHTAGS: 1, COMMERCIAL_CONTENT: 1, IMAGE_PROCESS: 2, IMAGE_GENERATE: 3 };
    return map[type] || 1;
  }

  // FLUJO COMPLETO: UPLOAD -> VALIDACION -> STORAGE -> ANALISIS -> GENERACION -> PROCESAMIENTO -> RESULTADO
  async fullPipeline(userId: string, productId: string) {
    const product = await this.products.findOne(userId, productId);
    const originalImage = product.images[0]?.originalUrl;
    if (!originalImage) throw new NotFoundException('Producto sin imagen');

    const analyzer = AIFactory.createAnalyzer(this.provider);
    const contentGen = AIFactory.createContentGenerator(this.provider);
    const imageProc = AIFactory.createImageProcessor(this.provider);

    // 1. ANALYZE - 1 crédito
    const refAnalyze = `ANALYZE_${productId}_${Date.now()}`;
    await this.credits.reserveCredits(userId, this.getCost('ANALYZE'), refAnalyze);
    let analysis: any;
    try {
      analysis = await analyzer.analyze(originalImage);
      await this.prisma.aiGeneration.create({ data: { userId, productId, generationType: 'ANALYZE', creditsUsed: 1, status: 'COMPLETED', inputData: { imageUrl: originalImage }, outputData: analysis } });
      await this.credits.confirmConsumption(userId, refAnalyze);
    } catch (e) {
      await this.credits.refundCredits(userId, 1, refAnalyze);
      await this.prisma.aiGeneration.create({ data: { userId, productId, generationType: 'ANALYZE', creditsUsed: 1, status: 'FAILED', errorMessage: String(e) } });
      throw e;
    }

    // 2. TITLE + DESCRIPTION - 1 crédito
    const refDesc = `DESCRIPTION_${productId}_${Date.now()}`;
    await this.credits.reserveCredits(userId, this.getCost('DESCRIPTION'), refDesc);
    let title: string, description: string;
    try {
      title = await contentGen.generateTitle(analysis);
      description = await contentGen.generateDescription(analysis, title);
      await this.prisma.product.update({ where: { id: productId }, data: { title, description, category: analysis.category, brand: analysis.brand, status: 'PROCESSING' } });
      await this.prisma.aiGeneration.create({ data: { userId, productId, generationType: 'DESCRIPTION', creditsUsed: 1, status: 'COMPLETED', outputData: { title, description } } });
      await this.credits.confirmConsumption(userId, refDesc);
    } catch (e) {
      await this.credits.refundCredits(userId, 1, refDesc);
      throw e;
    }

    // 3. HASHTAGS + COMMERCIAL - 1 crédito
    const refHash = `HASHTAGS_${productId}_${Date.now()}`;
    await this.credits.reserveCredits(userId, this.getCost('HASHTAGS'), refHash);
    let hashtags: string[], commercial: string;
    try {
      hashtags = await contentGen.generateHashtags(analysis, title);
      commercial = await contentGen.generateCommercialContent(analysis, title, description);
      await this.prisma.aiGeneration.create({ data: { userId, productId, generationType: 'HASHTAGS', creditsUsed: 1, status: 'COMPLETED', outputData: { hashtags, commercial } } });
      await this.credits.confirmConsumption(userId, refHash);
    } catch (e) {
      await this.credits.refundCredits(userId, 1, refHash);
      throw e;
    }

    // 4. IMAGE PROCESS - 2 créditos
    const refImg = `IMAGE_PROCESS_${productId}_${Date.now()}`;
    await this.credits.reserveCredits(userId, this.getCost('IMAGE_PROCESS'), refImg);
    try {
      const processed = await imageProc.removeBackground(originalImage);
      await this.products.addProcessedImage(userId, productId, processed.processedUrl, processed.thumbnailUrl);
      await this.prisma.aiGeneration.create({ data: { userId, productId, generationType: 'IMAGE_PROCESS', creditsUsed: 2, status: 'COMPLETED', outputData: processed } });
      await this.credits.confirmConsumption(userId, refImg);
    } catch (e) {
      await this.credits.refundCredits(userId, 2, refImg);
      await this.prisma.aiGeneration.create({ data: { userId, productId, generationType: 'IMAGE_PROCESS', creditsUsed: 2, status: 'FAILED', errorMessage: String(e) } });
      throw e;
    }

    await this.prisma.product.update({ where: { id: productId }, data: { status: 'COMPLETED' } });
    return this.products.findOne(userId, productId);
  }

  // Endpoints individuales
  async analyzeOnly(userId: string, productId: string) {
    const product = await this.products.findOne(userId, productId);
    const imageUrl = product.images[0]?.originalUrl;
    const analyzer = AIFactory.createAnalyzer(this.provider);
    const ref = `ANALYZE_${productId}_${Date.now()}`;
    const cost = this.getCost('ANALYZE');
    await this.credits.reserveCredits(userId, cost, ref);
    try {
      const result = await analyzer.analyze(imageUrl);
      await this.prisma.aiGeneration.create({ data: { userId, productId, generationType: 'ANALYZE', creditsUsed: cost, status: 'COMPLETED', outputData: result } });
      await this.credits.confirmConsumption(userId, ref);
      return result;
    } catch (e) {
      await this.credits.refundCredits(userId, cost, ref);
      throw e;
    }
  }

  async generateDescription(userId: string, productId: string) {
    const product = await this.products.findOne(userId, productId);
    const lastAnalysis = await this.prisma.aiGeneration.findFirst({ where: { productId, generationType: 'ANALYZE', status: 'COMPLETED' }, orderBy: { createdAt: 'desc' } });
    const analysis = lastAnalysis?.outputData || { category: product.category || 'Producto' };
    const gen = AIFactory.createContentGenerator(this.provider);
    const ref = `DESCRIPTION_${productId}_${Date.now()}`;
    const cost = this.getCost('DESCRIPTION');
    await this.credits.reserveCredits(userId, cost, ref);
    try {
      const title = await gen.generateTitle(analysis);
      const description = await gen.generateDescription(analysis, title);
      await this.prisma.product.update({ where: { id: productId }, data: { title, description } });
      await this.prisma.aiGeneration.create({ data: { userId, productId, generationType: 'DESCRIPTION', creditsUsed: cost, status: 'COMPLETED', outputData: { title, description } } });
      await this.credits.confirmConsumption(userId, ref);
      return { title, description };
    } catch (e) {
      await this.credits.refundCredits(userId, cost, ref);
      throw e;
    }
  }

  async generateHashtags(userId: string, productId: string) {
    const product = await this.products.findOne(userId, productId);
    const gen = AIFactory.createContentGenerator(this.provider);
    const ref = `HASHTAGS_${productId}_${Date.now()}`;
    const cost = this.getCost('HASHTAGS');
    await this.credits.reserveCredits(userId, cost, ref);
    try {
      const hashtags = await gen.generateHashtags({ category: product.category }, product.title || 'Producto');
      const commercial = await gen.generateCommercialContent({ category: product.category }, product.title || '', product.description || '');
      await this.prisma.aiGeneration.create({ data: { userId, productId, generationType: 'HASHTAGS', creditsUsed: cost, status: 'COMPLETED', outputData: { hashtags, commercial } } });
      await this.credits.confirmConsumption(userId, ref);
      return { hashtags, commercial };
    } catch (e) {
      await this.credits.refundCredits(userId, cost, ref);
      throw e;
    }
  }

  async processImage(userId: string, productId: string) {
    const product = await this.products.findOne(userId, productId);
    const imageUrl = product.images[0]?.originalUrl;
    const proc = AIFactory.createImageProcessor(this.provider);
    const ref = `IMAGE_PROCESS_${productId}_${Date.now()}`;
    const cost = this.getCost('IMAGE_PROCESS');
    await this.credits.reserveCredits(userId, cost, ref);
    try {
      const result = await proc.removeBackground(imageUrl);
      await this.products.addProcessedImage(userId, productId, result.processedUrl, result.thumbnailUrl);
      await this.prisma.aiGeneration.create({ data: { userId, productId, generationType: 'IMAGE_PROCESS', creditsUsed: cost, status: 'COMPLETED', outputData: result } });
      await this.credits.confirmConsumption(userId, ref);
      return result;
    } catch (e) {
      await this.credits.refundCredits(userId, cost, ref);
      throw e;
    }
  }
}