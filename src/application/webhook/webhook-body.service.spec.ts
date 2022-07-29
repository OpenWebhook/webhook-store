import { Test } from '@nestjs/testing';
import { left, right } from 'fp-ts/lib/Either';
import {
  FileUploadResult,
  FileUploadService,
} from '../../infrastructure/file-upload.service';
import { WebhookBodyService } from './webhook-body.service';

describe('WebhookBodyService', () => {
  let webhookBodyService: WebhookBodyService;
  const uploadRequestFile = jest.fn<
    Promise<FileUploadResult>,
    [file: Express.Multer.File]
  >();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WebhookBodyService,
        {
          provide: FileUploadService,
          useValue: {
            uploadRequestFile,
          },
        },
      ],
    }).compile();

    webhookBodyService = module.get<WebhookBodyService>(WebhookBodyService);
  });

  it('should be defined', () => {
    expect(webhookBodyService).toBeDefined();
  });

  it('should handle empty body and no files', async () => {
    const body = await webhookBodyService.buildBodyWithFiles({}, []);
    expect(body).toEqual({});
  });

  it('should handle empty body and 1 files and upload succeeds', async () => {
    uploadRequestFile.mockResolvedValueOnce(
      right({ fileLocation: 'fileLocation' }),
    );

    const body = await webhookBodyService.buildBodyWithFiles({}, [
      { originalname: 'coucou.test' } as Express.Multer.File,
    ]);
    expect(body).toEqual({ 'coucou.test': 'fileLocation' });
  });

  it('should handle empty body and 1 files and upload fails', async () => {
    uploadRequestFile.mockResolvedValueOnce(left(new Error('Upload failed')));

    const body = await webhookBodyService.buildBodyWithFiles({}, [
      { originalname: 'coucou.test' } as Express.Multer.File,
    ]);
    expect(body).toEqual({ 'coucou.test': 'Could not upload file' });
  });
});
