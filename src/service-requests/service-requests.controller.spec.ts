import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';

describe('ServiceRequestsController', () => {
  let controller: ServiceRequestsController;

  beforeEach(async () => {
    const mockServiceRequestsService = {
      create: jest.fn().mockResolvedValue({
        _id: 'request123',
        title: 'Fix AC',
        description: 'AC not working',
        status: 'open',
        createdBy: 'user123',
      }),
      assign: jest.fn().mockResolvedValue({
        _id: 'request123',
        assignedTo: 'provider456',
      }),
      updateStatus: jest.fn().mockResolvedValue({
        _id: 'request123',
        status: 'in_progress',
      }),
      findAll: jest.fn().mockResolvedValue([
        {
          _id: 'request123',
          title: 'Fix AC',
          status: 'open',
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceRequestsController],
      providers: [
        {
          provide: ServiceRequestsService,
          useValue: mockServiceRequestsService,
        },
      ],
    }).compile();

    controller = module.get<ServiceRequestsController>(
      ServiceRequestsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
