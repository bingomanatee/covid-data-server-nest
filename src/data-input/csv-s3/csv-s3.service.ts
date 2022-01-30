import { Injectable } from '@nestjs/common';
const S3 = require('aws-sdk/clients/s3');
const S3BlobStore = require('s3-blob-store');
const feathers = require('@feathersjs/feathers');
const BlobService = require('feathers-blob');



@Injectable()
export class CsvS3Service {
    store: any;
    bucket: any
    constructor(bucket:string = 'covid-csv-storage') {
        this.bucket = bucket;
        const s3 = new S3({
          endpoint: 'https://s3.us-west-2.amazonaws.com',
        });
        
        this.store = S3BlobStore({
            client: s3,
            bucket: this.bucket
        });   
    }
    
    public writeStreamToKey(key:string) {
        return new Promise((done, fail) => {
            this.store.createWriteStream({key}, (err, stream) => {
                err ? fail(err) : done(stream);
            });
        });
    }
    
    public setKeys
}