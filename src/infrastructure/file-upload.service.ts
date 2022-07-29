import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import * as S3 from 'aws-sdk/clients/s3';
import { Either, left, right } from 'fp-ts/lib/Either';

type FileUploadResult = Either<unknown, { fileLocation: string }>;

@Injectable()
export class FileUploadService {
  private readonly s3: S3;
  private readonly prexifxPath: string | undefined | null;
  private readonly bucketName: string;

  constructor(configService: ConfigService) {
    const { accessKeyId, secretAccessKey, endpoint } = configService.get(
      's3BucketCredentials',
    );
    this.s3 = new S3({
      accessKeyId,
      secretAccessKey,
      endpoint,
    });
    this.prexifxPath = configService.get('s3BucketPrefixPath');
    // @Samox TODO handle case for no S3 configured
    this.bucketName = configService.get('s3BucketName') || 'no-bucket';
  }

  public async uploadRequestFile(
    file: Express.Multer.File,
  ): Promise<FileUploadResult> {
    try {
      const params = this.putObjectRequestParamFactory(file);
      const result = await new Promise<S3.ManagedUpload.SendData>(
        (resolve, reject) => {
          this.s3.upload(
            params,
            (err?: any, data?: S3.ManagedUpload.SendData) => {
              err && reject(err);
              data && resolve(data);
            },
          );
        },
      );
      return right({ fileLocation: result.Location });
    } catch (err: unknown) {
      return left(err);
    }
  }

  private putObjectRequestParamFactory(
    file: Express.Multer.File,
  ): S3.Types.PutObjectRequest {
    const unixTime = Math.floor(+new Date() / 1000);
    const params = {
      Bucket: this.bucketName,
      Key: `${this.prexifxPath}${unixTime}_${file.originalname}`,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };
    return params;
  }
}
