import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from './storage.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService, private storage: StorageService) {}

  private validateFile(file: Express.Multer.File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.mimetype)) throw new BadRequestException(`Formato no permitido. Usa JPG, PNG o WEBP`);
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) throw new BadRequestException(`Archivo demasiado grande. Máx 10MB`);
    if (file.size < 1024) throw new BadRequestException('Imagen no válida');
  }

  async create(userId: string, file: Express.Multer.File, dto?: any) {
    if (!file) throw new BadRequestException('Imagen requerida');
    this.validateFile(file);

    const uploaded = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype, userId);

    const product = await this.prisma.product.create({
      data: {
        userId,
        title: dto?.title || 'Producto sin título',
        status: 'DRAFT',
        images: {
          create: {
            originalUrl: uploaded.url,
            type: 'ORIGINAL',
          }
        }
      },
      include: { images: true },
    });

    return product;
  }

  async findAll(userId: string, query: any = {}) {
    const { search, category, status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = query;
    const where: any = { userId };
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (category) where.category = category;
    if (status) where.status = status;

    const skip = (parseInt(page)-1)*parseInt(limit);
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { images: true },
        orderBy: { [sortBy]: order },
        skip, take: parseInt(limit),
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page: parseInt(page), limit: parseInt(limit) };
  }

  async findOne(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, userId },
      include: { images: true, aiGenerations: { orderBy: { createdAt: 'desc' } } },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async remove(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, userId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    // No borrar S3 en MVP para auditoría, solo marcar
    await this.prisma.product.delete({ where: { id: productId } });
    return { ok: true };
  }

  async update(userId: string, productId: string, data: any) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, userId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.prisma.product.update({ where: { id: productId }, data });
  }

  async addProcessedImage(userId: string, productId: string, processedUrl: string, thumbnailUrl?: string) {
    await this.findOne(userId, productId);
    return this.prisma.productImage.create({
      data: { productId, originalUrl: processedUrl, processedUrl, thumbnailUrl, type: 'PROCESSED' }
    });
  }
}