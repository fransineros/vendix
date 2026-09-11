import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { StorageService } from './storage.service';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [CreditsModule],
  providers: [ProductsService, StorageService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}