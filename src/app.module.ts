import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/gap-db'),
    UsersModule,
    ServiceRequestsModule,
  ],
})
export class AppModule {}