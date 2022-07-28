export default () => ({
  s3BucketCredentials: {
    accessKeyId: process.env.S3_BUCKET_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_BUCKET_ENDPOINT,
  },
  s3BucketPrefixPath: process.env.S3_BUCKET_PREFIX_PATH,
  s3BucketName: process.env.S3_BUCKET_NAME,
});
