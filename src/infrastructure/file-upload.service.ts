import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import * as S3 from 'aws-sdk/clients/s3';

@Injectable()
export class FileUploadService {
  private readonly s3: S3;
  constructor(configService: ConfigService) {
    const { accessKeyId, secretAccessKey, endpoint } = configService.get(
      's3BucketCredentials',
    );
    this.s3 = new S3({
      accessKeyId,
      secretAccessKey,
      endpoint,
    });
  }

  public async uploadRequestFile(file: Express.Multer.File): Promise<any> {
    try {
      const unixTime = Math.floor(+new Date() / 1000);
      const params = {
        Bucket: 'webhook-store',
        Key: `${process.env.S3_BUCKET_PREFIX_PATH}${unixTime}_${file.originalname}`, // file name with timestamp
        Body: file.buffer,
        ACL: 'public-read', // public read policy
        ContentType: file.mimetype,
      };

      // Uploading files to the bucket
      try {
        const result = await new Promise((resolve, reject) => {
          this.s3.upload(
            params,
            (err?: any, data?: S3.ManagedUpload.SendData) => {
              err && reject(err);
              data && resolve(data);
            },
          );
        });

        console.log(result);
      } catch (err) {
        console.error(err);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
