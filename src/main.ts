import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
// app.enableCors({
//   origin:'http://localhost:3000',
//   methods:'GET,POST,PUT,DELETE'
// })
app.enableCors()
  const config = new DocumentBuilder()
    .setTitle('Appointment Api')
    .setDescription('Api for Appointment')
    .setVersion('1.0')
    .addTag('Appointemnt')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
