import { Test, TestingModule } from '@nestjs/testing';
import { MeasureController } from './measure.controller';
import { MeasureService } from './measure.service';

describe('MeasureController', () => {
  let controller: MeasureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeasureController],
      providers: [MeasureService],
    }).compile();

    controller = module.get<MeasureController>(MeasureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
