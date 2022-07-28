import { Injectable } from '@nestjs/common';
import * as S3 from 'aws-sdk/clients/s3';

const s3 = new S3({
  accessKeyId: process.env.S3_BUCKET_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_BUCKET_ENDPOINT,
});

@Injectable()
export class FileUploadService {
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
          s3.upload(params, (err?: any, data?: S3.ManagedUpload.SendData) => {
            err && reject(err);
            data && resolve(data);
          });
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
