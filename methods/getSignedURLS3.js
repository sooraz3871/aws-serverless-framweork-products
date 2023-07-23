const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const expirationTime = 900; // Expiration time in seconds (15 minutes)

module.exports.generateSignedURL = async (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expirationTime,
  };

  try {
    const signedUrl = await new Promise((resolve, reject) => {
      s3.getSignedUrl("getObject", params, (error, signedUrl) => {
        if (error) {
          reject(error);
        } else {
          resolve(signedUrl);
        }
      });
    });

    return signedUrl;
  } catch (error) {
    throw error;
  }
};
