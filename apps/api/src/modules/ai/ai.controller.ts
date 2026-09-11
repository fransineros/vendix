import { Controller, Post, UseGuards, Req, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private ai: AiService) {}

  @Post(':id/analyze')
  analyze(@Req() req: any, @Param('id') id: string) {
    return this.ai.analyzeOnly(req.user.id, id);
  }

  @Post(':id/generate-description')
  genDesc(@Req() req: any, @Param('id') id: string) {
    return this.ai.generateDescription(req.user.id, id);
  }

  @Post(':id/generate-hashtags')
  genHash(@Req() req: any, @Param('id') id: string) {
    return this.ai.generateHashtags(req.user.id, id);
  }

  @Post(':id/process-image')
  procImg(@Req() req: any, @Param('id') id: string) {
    return this.ai.processImage(req.user.id, id);
  }

  @Post(':id/generate-all')
  generateAll(@Req() req: any, @Param('id') id: string) {
    return this.ai.fullPipeline(req.user.id, id);
  }
}