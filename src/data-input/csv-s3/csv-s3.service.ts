import { Injectable, Inject } from '@nestjs/common';
import { inspect } from 'util';
import  {Readable} from 'stream';
import { LoggingService } from './../../logging/logging.service';

const { S3Client : S3, GetObjectCommand, HeadObjectCommand, ListObjectsCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

//const S3BlobStore = require('s3-blob-store');

type ObjectKeys = {
  Key: string;
};

const bucketIdentity = {
  endpoint: 'https://s3.us-west-2.amazonaws.com',
  accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.AWS_BUCKET_SECRET,
  apiVersion: '2006-03-01',
  region: 'us-west-2'
};

@Injectable()
export class CsvS3Service {
  bucket: any;
  s3: any;
  loggingService: any;

  constructor(@Inject('bucket') bucket: string, 
    @Inject(LoggingService) loggingService,) {
    this.bucket = bucket;
    this.s3 = new S3(bucketIdentity);
    this.loggingService = loggingService;
  }

  public async getBucketInfo(key: string) {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };
    
    return await this.s3.send(new HeadObjectCommand(params));
  }

  public async getBucketKeys(): Promise<ObjectKeys[]> {
    const result = await this.s3.send(new ListObjectsCommand({
      Bucket: this.bucket,
      Region: 'us-west-2'
    }));
    
    return result.Contents;
  }

  public async writeStringToKey(key: string, data: string) {
    const param = {
      Bucket: this.bucket,
      Key: key,
      Body: Buffer.from(data),
    };
    
    return this.s3.send(new PutObjectCommand(param));
  }

  public async readKey(key: string) {
    const param = {
      Bucket: this.bucket,
      Key: key,
    };

   const command = new GetObjectCommand(param);
    const item = await this.s3.send(command);
    return item.Body;
  }
}
