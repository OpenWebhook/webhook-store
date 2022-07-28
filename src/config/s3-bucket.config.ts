export default () => ({
  accessKeyId: process.env.S3_BUCKET_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_BUCKET_ENDPOINT,
  prefixPath: process.env.S3_BUCKET_PREFIX_PATH,
  bucket: process.env.S3_BUCKET_NAME,
});
