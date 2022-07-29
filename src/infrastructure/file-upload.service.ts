import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as S3 from 'aws-sdk/clients/s3';
import { Either, left, right } from 'fp-ts/lib/Either';
import s3BucketConfig from '../config/s3-bucket.config';

export type FileUploadResult = Either<unknown, { fileLocation: string }>;

@Injectable()
export class FileUploadService {
  private readonly s3: S3;
  private readonly prexifxPath: string | undefined | null;
  private readonly bucketName: string;

  constructor(
    @Inject(s3BucketConfig.KEY)
    dbConfig: ConfigType<typeof s3BucketConfig>,
  ) {
    const { accessKeyId, secretAccessKey, endpoint } =
      dbConfig.s3BucketCredentials;

    this.s3 = new S3({
      accessKeyId,
      secretAccessKey,
      endpoint,
    });
    this.prexifxPath = dbConfig.s3BucketPrefixPath;
    // @Samox TODO handle case for no S3 configured
    this.bucketName = dbConfig.s3BucketName || 'no-bucket';
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
