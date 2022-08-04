import { Test } from '@nestjs/testing';
import { either } from 'fp-ts';
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
    const body = await webhookBodyService.buildBodyWithFiles({}, [])();
    expect(body).toEqual({});
  });

  it('should handle empty body and 1 files and upload succeeds', async () => {
    uploadRequestFile.mockResolvedValueOnce(
      either.right({ fileLocation: 'fileLocation' }),
    );

    const body = await webhookBodyService.buildBodyWithFiles({}, [
      { originalname: 'coucou.test' } as Express.Multer.File,
    ])();
    expect(body).toEqual({ 'coucou.test': 'fileLocation' });
  });

  it('should handle empty body and 1 files and upload fails', async () => {
    uploadRequestFile.mockResolvedValueOnce(
      either.left(new Error('Upload failed')),
    );

    const body = await webhookBodyService.buildBodyWithFiles({}, [
      { originalname: 'coucou.test' } as Express.Multer.File,
    ])();
    expect(body).toEqual({ 'coucou.test': 'Could not upload file' });
  });
});
