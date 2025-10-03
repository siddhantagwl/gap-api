import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequest, ServiceRequestSchema } from './schemas/service-request.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ServiceRequest.name, schema: ServiceRequestSchema }]),
    UsersModule,
  ],
  controllers: [ServiceRequestsController],
  providers: [ServiceRequestsService],
})
export class ServiceRequestsModule {}