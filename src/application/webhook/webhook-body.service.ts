import { Injectable } from '@nestjs/common';
import { FileUploadService } from '../../infrastructure/file-upload.service';
import { CreateWebhookInput } from './webhook.service';
import { task } from 'fp-ts';

@Injectable()
export class WebhookBodyService {
  constructor(private readonly fileUploadService: FileUploadService) {}

  public buildBodyWithFiles(
    body: any,
    files: Array<Express.Multer.File>,
  ): task.Task<CreateWebhookInput['body']> {
    return async () => {
      const filenamesWithLocations = await files.reduce(
        async (accPromise, file) => {
          const acc = await accPromise;
          const uploadedFile = await this.fileUploadService.uploadRequestFile(
            file,
          );
          if (uploadedFile._tag === 'Right') {
            acc[file.originalname] = uploadedFile.right.fileLocation;
          }
          if (uploadedFile._tag === 'Left') {
            acc[file.originalname] = 'Could not upload file';
          }
          return acc;
        },
        Promise.resolve({} as Record<string, string>),
      );

      return Object.assign({}, body, filenamesWithLocations);
    };
  }
}
