import { Controller, Post, Get, Delete, Patch, UseGuards, Req, UseInterceptors, UploadedFile, Body, Param, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 10*1024*1024 } }))
  async create(@Req() req: any, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.products.create(req.user.id, file, body);
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    return this.products.findAll(req.user.id, query);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.products.findOne(req.user.id, id);
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.products.update(req.user.id, id, body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.products.remove(req.user.id, id);
  }
}