import { Test, TestingModule } from '@nestjs/testing';
import { NovelsService } from './novels.service';

describe('NovelsService', () => {
  let service: NovelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NovelsService],
    }).compile();

    service = module.get<NovelsService>(NovelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
