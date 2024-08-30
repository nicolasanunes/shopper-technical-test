import { Test, TestingModule } from '@nestjs/testing';
import { MeasureController } from '../measure.controller';
import { MeasureService } from '../measure.service';
import { createMeasureMock } from '../__mock__/create-measure.mock';
import { responseDtoMock } from '../__mock__/response-dto.mock';
import { confirmMeasureMock } from '../__mock__/confirm-measure.mock';

describe('MeasureController', () => {
  let measureController: MeasureController;
  let measureService: MeasureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MeasureService,
          useValue: {
            createMeasure: jest.fn().mockResolvedValue(responseDtoMock),
            confirmMeasure: jest.fn().mockResolvedValue(responseDtoMock),
            listMeasuresByCustomerCode: jest
              .fn()
              .mockResolvedValue(responseDtoMock),
          },
        },
      ],
      controllers: [MeasureController],
    }).compile();

    measureController = module.get<MeasureController>(MeasureController);
    measureService = module.get<MeasureService>(MeasureService);
  });

  it('should be defined', () => {
    expect(measureController).toBeDefined();
    expect(measureService).toBeDefined();
  });

  it('should return status OK in createMeasure', async () => {
    const measure = await measureController.createMeasure(createMeasureMock);

    expect(measure).toEqual(responseDtoMock.responseObject);
  });

  it('should return status OK in confirmMeasure', async () => {
    const measure = await measureController.confirmMeasure(confirmMeasureMock);

    expect(measure).toEqual(responseDtoMock.responseObject);
  });

  it('should return status OK in listMeasuresByCustomerCode', async () => {
    const measure =
      await measureController.listMeasuresByCustomerCode('SAJ3HSJA');

    expect(measure).toEqual(responseDtoMock.responseObject);
  });
});
