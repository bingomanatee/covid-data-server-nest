import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DailyCasesService } from './daily-cases/daily-cases.service';
import { PrismaService } from './prisma/prisma.service';
import { DataInputModule } from './data-input/data-input.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [DataInputModule,
      ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'frontend/dist'),
    }),
    ],
  controllers: [],
  providers: [AppService, DailyCasesService, PrismaService],
})
export class AppModule {}
