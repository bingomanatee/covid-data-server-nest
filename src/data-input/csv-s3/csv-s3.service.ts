import { Injectable, Inject } from '@nestjs/common';
import { S3Client, PutObjectCommand , ListObjectsCommand} from "@aws-sdk/client-s3";
const { Readable } = require('stream');
import {Blob} from 'buffer';
const fs = require('fs');
import { Upload } from "@aws-sdk/lib-storage";

const bucketIdentity = {
  endpoint: 'https://s3.us-west-2.amazonaws.com',
  region: 'us-west-2',
/*  accessKeyId : process.env.AWS_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.AWS_BUCKET_SECRET,*/
};

type ObjectKeys = {
  Key: string;
};

console.log('bucket identity', bucketIdentity);

@Injectable()
export class CsvS3Service {
  store: any;
  bucket: any;
  s3: any;

  constructor(@Inject('bucket') bucket: string) {
    this.bucket = bucket;
    this.s3 = new S3Client(bucketIdentity);

  }

  public async getBucketKeys(): Promise<ObjectKeys[]> {
    return new Promise(async (done, fail) => {
      try {
      const data = await this.s3.send(new ListObjectsCommand({Bucket: this.bucket}));
      console.log('getBucketKeys fetched', data);
      done(data.Contents);
      } catch (err) {
        fail(err);
      }
    });
  }

  public async writeStringToKey(key: string, data: string) {
 /*   const param = {
          Bucket: 'sql-dev',
          Key: 'Report',
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
      })*/
      

    const filePath = `../s3-scratch/${key}`;
    await fs.writeFile(filePath, data, async (err) => {
      console.log('file written ? eror =', err)
         const stream = fs.createReadStream(filePath);
         const params = {
          Bucket: this.bucket,
          Body: stream,
          Key: key
        };
        
        const upload = new Upload({
          params,
          client: this.s3,
          queueSize: 3,
        });
            
        const result = await upload.done();
        return result;
    });
  }

}
