import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from './../../logging/logging.service';

const {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');

//const S3BlobStore = require('s3-blob-store');

type ObjectKeys = {
  Key: string;
};

@Injectable()
export class CsvS3Service {
  bucket: any;
  s3Instance: any;
  loggingService: any;

  constructor(
    @Inject('bucket') bucket: string,
    @Inject('s3Instance') s3Instance: any,
    @Inject(LoggingService) loggingService,
  ) {
    this.bucket = bucket;
    this.s3Instance = s3Instance;
    this.loggingService = loggingService;
  }

  public async getBucketInfo(key: string) {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    return await this.s3Instance.send(new HeadObjectCommand(params));
  }

  public async getBucketKeys(): Promise<ObjectKeys[]> {
    const result = await this.s3Instance.send(
      new ListObjectsCommand({
        Bucket: this.bucket,
        Region: 'us-west-2',
      }),
    );

    return result.Contents;
  }

  public async writeStringToKey(key: string, data: string) {
    const param = {
      Bucket: this.bucket,
      Key: key,
      Body: Buffer.from(data),
    };

    return this.s3Instance.send(new PutObjectCommand(param));
  }

  public async readKey(key: string) {
    const param = {
      Bucket: this.bucket,
      Key: key,
    };

    const command = new GetObjectCommand(param);
    const item = await this.s3Instance.send(command);
    return item.Body;
  }
}
