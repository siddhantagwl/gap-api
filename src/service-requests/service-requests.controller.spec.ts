import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRequestsController } from './service-requests.controller';

describe('ServiceRequestsController', () => {
  let controller: ServiceRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceRequestsController],
    }).compile();

    controller = module.get<ServiceRequestsController>(ServiceRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
