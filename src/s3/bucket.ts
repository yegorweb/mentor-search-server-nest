import { S3 } from "aws-sdk";

export let s3 = new S3({
    credentials: {
      accessKeyId: `${process.env.SELECTEL_ACCOUNT}_${process.env.BUCKET_ACCOUNT}`,
      secretAccessKey: process.env.BUCKET_PASSWORD
    },
    endpoint: 'https://s3.storage.selcloud.ru',
    s3ForcePathStyle: true,
    region: 'ru-1',
    apiVersion: 'latest'
})
