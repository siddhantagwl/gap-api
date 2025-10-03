import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRequestsService } from './service-requests.service';
import { getModelToken } from '@nestjs/mongoose';
import { ServiceRequest } from './schemas/service-request.schema';
import { UsersService } from '../users/users.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ServiceRequestsService', () => {
  let service: ServiceRequestsService;
  let mockServiceRequestModel: any;
  let mockUsersService: any;

  beforeEach(async () => {
    // Mock data - fake users for testing
    const mockClient = {
      _id: 'client123',
      name: 'John Doe',
      email: 'john@test.com',
      role: 'client',
    };

    const mockServiceProvider = {
      _id: 'provider456',
      name: 'Jane Smith',
      email: 'jane@test.com',
      role: 'service_provider',
    };

    // Mock the database model
    mockServiceRequestModel = function (dto: any) {
      return {
        ...dto,
        _id: 'request789',
        status: 'open',
        save: jest.fn().mockResolvedValue({
          _id: 'request789',
          ...dto,
          status: 'open',
        }),
      };
    };

    mockServiceRequestModel.findById = jest.fn();
    mockServiceRequestModel.findByIdAndUpdate = jest.fn();
    mockServiceRequestModel.find = jest.fn();

    // Mock the UsersService
    mockUsersService = {
      findById: jest.fn((id: string) => {
        if (id === 'client123') return Promise.resolve(mockClient);
        if (id === 'provider456') return Promise.resolve(mockServiceProvider);
        throw new NotFoundException('User not found');
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRequestsService,
        {
          provide: getModelToken(ServiceRequest.name),
          useValue: mockServiceRequestModel,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ServiceRequestsService>(ServiceRequestsService);
  });

  // TEST 1
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TEST 2: Client can create a service request
  it('should allow a client to create a service request', async () => {
    const dto = {
      title: 'Fix elevator',
      description: 'Elevator is stuck',
      createdBy: 'client123',
    };

    const result = await service.create(dto);

    expect(result).toBeDefined();
    expect(result.title).toBe('Fix elevator');
    expect(result.status).toBe('open');
    expect(mockUsersService.findById).toHaveBeenCalledWith('client123');
  });

  // TEST 3: Service provider cannot create a service request
  it('should throw ForbiddenException when service provider tries to create request', async () => {
    const dto = {
      title: 'Fix elevator',
      description: 'Elevator is stuck',
      createdBy: 'provider456',
    };

    await expect(service.create(dto)).rejects.toThrow(ForbiddenException);
    await expect(service.create(dto)).rejects.toThrow(
      'Only clients can create service requests',
    );
  });

  // TEST 4: Can assign service provider to a request
  it('should allow assigning a service provider to a request', async () => {
    const mockRequest = {
      _id: 'request789',
      title: 'Fix AC',
      status: 'open',
      assignedTo: 'provider456',
    };

    mockServiceRequestModel.findByIdAndUpdate.mockResolvedValue(mockRequest);

    const result = await service.assign('request789', 'provider456');

    expect(result).toBeDefined();
    expect(result.assignedTo).toBe('provider456');
    expect(mockServiceRequestModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'request789',
      { assignedTo: 'provider456' },
      { new: true },
    );
  });

  // TEST 5: Cannot assign a client to a request
  it('should throw ForbiddenException when trying to assign a client to a request', async () => {
    await expect(service.assign('request789', 'client123')).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.assign('request789', 'client123')).rejects.toThrow(
      'Only service providers can be assigned to requests',
    );
  });

  // TEST 6: Can update status from open to in_progress
  it('should allow updating status from open to in_progress', async () => {
    const mockRequest = {
      _id: 'request789',
      status: 'open',
      save: jest.fn().mockResolvedValue({
        _id: 'request789',
        status: 'in_progress',
      }),
    };

    mockServiceRequestModel.findById.mockResolvedValue(mockRequest);

    const result = await service.updateStatus('request789', 'in_progress');

    expect(result.status).toBe('in_progress');
    expect(mockRequest.save).toHaveBeenCalled();
  });

  // TEST 7: Cannot skip status (open to done)
  it('should throw ForbiddenException when trying to skip status', async () => {
    const mockRequest = {
      _id: 'request789',
      status: 'open',
      save: jest.fn(),
    };

    mockServiceRequestModel.findById.mockResolvedValue(mockRequest);

    await expect(service.updateStatus('request789', 'done')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
