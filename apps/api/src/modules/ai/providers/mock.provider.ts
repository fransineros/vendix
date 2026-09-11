import { AIProductAnalyzer, AIContentGenerator, AIImageProcessor } from '../interfaces';

export class MockAnalyzer implements AIProductAnalyzer {
  async analyze(imageUrl: string) {
    await new Promise(r => setTimeout(r, 800));
    return {
      category: 'Zapatillas deportivas',
      brand: 'Urban',
      colors: ['negro', 'blanco'],
      attributes: { material: 'malla transpirable', suela: 'antideslizante', uso: 'running urbano' },
      confidence: 0.94,
    };
  }
}

export class MockContentGenerator implements AIContentGenerator {
  async generateTitle(analysis: any) {
    await new Promise(r => setTimeout(r, 600));
    return `${analysis.brand || ''} ${analysis.category} - Comodidad y Estilo Urbano`.trim();
  }
  async generateDescription(analysis: any, title: string) {
    await new Promise(r => setTimeout(r, 800));
    return `${title} \n\nDescubre la combinación perfecta de estilo y rendimiento. Fabricadas con ${analysis.attributes.material}, estas ${analysis.category.toLowerCase()} ofrecen máxima comodidad para tu día a día.\n\nCaracterísticas:\n- Material: ${analysis.attributes.material}\n- Suela: ${analysis.attributes.suela}\n- Colores: ${analysis.colors.join(', ')}\n- Ideal para: ${analysis.attributes.uso}\n\n¡Hazte con ellas y eleva tu estilo!`;
  }
  async generateHashtags(analysis: any, title: string) {
    await new Promise(r => setTimeout(r, 400));
    return ['#zapatillas', '#urbanshoes', '#running', '#modaurbana', '#vendix', `#${analysis.category.replace(/\s/g,'')}`, '#novedad', '#oferta', '#estilo', '#comodidad'];
  }
  async generateCommercialContent(analysis: any, title: string, description: string) {
    await new Promise(r => setTimeout(r, 700));
    return `🚀 ¡NUEVO! ${title}\n\n¿Cansado de zapatillas incómodas?\n\n${description.slice(0,120)}...\n\n✅ Envío gratis 24h\n✅ Devolución 30 días\n🔥 -20% con código VENDIX20\n\n👉 Compra ahora: link en bio\n\n#vendix #ecommerce`;
  }
}

export class MockImageProcessor implements AIImageProcessor {
  async removeBackground(imageUrl: string) {
    await new Promise(r => setTimeout(r, 1200));
    // En prod aquí se llamaría a Remove.bg / Stability / Replicate
    return { processedUrl: imageUrl.replace('original', 'processed') || imageUrl, thumbnailUrl: imageUrl };
  }
  async enhanceImage(imageUrl: string) {
    await new Promise(r => setTimeout(r, 1000));
    return { processedUrl: imageUrl };
  }
}