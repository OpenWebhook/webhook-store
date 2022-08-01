import { ConfigModule, registerAs } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { either } from 'fp-ts';
import { FileUploadService } from './file-upload.service';

const mockedPutObject = jest.fn();

jest.mock('aws-sdk/clients/s3', () => {
  return class S3 {
    upload(params: any, cb: any) {
      return mockedPutObject(params, cb);
    }
  };
});

const s3mockedConfigValues = {
  s3BucketCredentials: {
    accessKeyId: 'process.env.S3_BUCKET_ACCESS_KEY_ID',
    secretAccessKey: 'process.env.S3_BUCKET_SECRET_ACCESS_KEY',
    endpoint: 'process.env.S3_BUCKET_ENDPOINT',
  },
  s3BucketPrefixPath: 'process.env.S3_BUCKET_PREFIX_PATH',
  s3BucketName: 'process.env.S3_BUCKET_NAME',
};

const s3mockedConfig = registerAs('s3Bucket', () => s3mockedConfigValues);

describe('fileUploadService', () => {
  let fileUploadService: FileUploadService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [s3mockedConfig] })],
      providers: [FileUploadService],
    }).compile();

    fileUploadService = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(fileUploadService).toBeDefined();
  });

  it('should return result in right Either with file location', async () => {
    mockedPutObject.mockImplementationOnce((params: any, cb: any) => {
      cb(null, { Location: 'fileLocation' });
    });
    const file = { originalname: 'coucou.test' } as Express.Multer.File;
    const result = await fileUploadService.uploadRequestFile(file);
    expect(result).toEqual(either.right({ fileLocation: 'fileLocation' }));
  });

  it('should return result in left Either if there is an error', async () => {
    mockedPutObject.mockImplementationOnce((params: any, cb: any) => {
      cb(new Error('Cannot upload file'), null);
    });
    const file = { originalname: 'coucou.test' } as Express.Multer.File;
    const result = await fileUploadService.uploadRequestFile(file);
    expect(result).toEqual(either.left(new Error('Cannot upload file')));
  });
});
