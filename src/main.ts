import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // <-- Importa esto




async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Usuarios')
    .setDescription('Documentación de la API para manejo de usuarios y sesión')
    .setVersion('1.0')
    .addBearerAuth() // <-- importante para JWT
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // <-- genera en /api

  await app.listen(3000);
}
bootstrap();
