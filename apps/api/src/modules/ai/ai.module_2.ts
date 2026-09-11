import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { CreditsModule } from '../credits/credits.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [CreditsModule, ProductsModule],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}