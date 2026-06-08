const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

(async () => {
    try {
        await s3.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: 'test/hello.txt',
            Body: 'hello world',
            ContentType: 'text/plain',
        }));
        console.log('✅ SUKSES — token & bucket OK');
    } catch (e) {
        console.log('❌ GAGAL:', e.name, '-', e.message);
    }
})();