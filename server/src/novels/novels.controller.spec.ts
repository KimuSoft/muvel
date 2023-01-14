import { Test, TestingModule } from '@nestjs/testing';
import { NovelsController } from './novels.controller';

describe('NovelsController', () => {
  let controller: NovelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NovelsController],
    }).compile();

    controller = module.get<NovelsController>(NovelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
