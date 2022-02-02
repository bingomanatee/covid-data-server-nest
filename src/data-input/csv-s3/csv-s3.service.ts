import { Injectable, Inject } from '@nestjs/common';
import { Readable } from 'stream';

const S3 = require('aws-sdk/clients/s3');
const S3BlobStore = require('s3-blob-store');

type ObjectKeys = {
  Key: string;
};

const bucketIdentity = {
  endpoint: 'https://s3.us-west-2.amazonaws.com',
  accessKeyId : process.env.AWS_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.AWS_BUCKET_SECRET,
  apiVersion: '2006-03-01'
};
console.log('bucket identity', bucketIdentity);

@Injectable()
export class CsvS3Service {
  store: any;
  bucket: any;
  s3: any;

  constructor(@Inject('bucket') bucket: string) {
    this.bucket = bucket;
    this.s3 = new S3(bucketIdentity);

    this.store = S3BlobStore({
      client: this.s3,
      bucket: this.bucket,
    });
  }
  
  public async getBucketInfo(key: string) {
  const params = {
    Bucket:  this.bucket, 
    Key: key
   };
   return new Promise((done, fail) => {
      this.s3.headObject(params, function(err, data) {
     if (err) fail(err);
     done(data);
    });
   });
  }
  
  public async getBucketKeys(): Promise<ObjectKeys[]> {
    return new Promise((done, fail) => {
      return this.s3.listObjects(
        {
          Bucket: this.bucket,
        },
        (err, result) => {
          if (err) return fail(err);
          done(result.Contents);
        },
      );
    });
  }

  public async writeStringToKey(key: string, data: string) {
    const param = {
          Bucket: this.bucket,
          Key: key,
          Body: Buffer.from(data)
      }; 
      
      return new Promise((done, fail) => {
        this.s3.putObject(param, (err, result) => {
          if (err) {
            console.log('put error:', err);
          } else {
            done(result);
          }
        });
      })
  }

}
