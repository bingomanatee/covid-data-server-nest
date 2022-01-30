import { Injectable, Inject } from '@nestjs/common';

const S3 = require('aws-sdk/clients/s3');
const S3BlobStore = require('s3-blob-store');

type ObjectKeys = {
  Key: string;
};

@Injectable()
export class CsvS3Service {
  store: any;
  bucket: any;
  s3: any;

  constructor(@Inject('bucket') bucket: string) {
    this.bucket = bucket;
    this.s3 = new S3({
      endpoint: 'https://s3.us-west-2.amazonaws.com',
    });

    this.store = S3BlobStore({
      client: this.s3,
      bucket: this.bucket,
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

  public writeStreamToKey(key: string) {
    return new Promise((done, fail) => {
      this.store.createWriteStream({ key }, (err, stream) => {
        err ? fail(err) : done(stream);
      });
    });
  }

  public setKeys;
}
