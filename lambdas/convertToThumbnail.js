const AWS = require("aws-sdk");
const Jimp = require("jimp");
const axios = require('axios');

const logger = require("../utils/logger");

const s3 = new AWS.S3();

module.exports.convertToThumbnail = async (event) => {
  try {
    logger.info(event);
   
    const { bucketName , imageURL, thumbnailKey} = event?.detail;
    // Download the image from the URL
    const imageBuffer = await downloadImage(imageURL);

    // Resize the image to a thumbnail
    const thumbnailBuffer = await resizeImageToThumbnail(imageBuffer);

    // Generate a unique filename for the thumbnail

    // Upload the thumbnail to the S3 bucket
    await s3
      .putObject({
        Bucket: bucketName,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Thumbnail created and stored successfully",
      }),
    };
  } catch (error) {
    logger.error("Error converting to thumbnail:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error converting to thumbnail" }),
    };
  }
};

async function downloadImage(imageURL) {
  try {
    // Make an HTTP GET request to download the image
    const response = await axios.get(imageURL, { responseType: "arraybuffer" });
    // Return the image data as a Buffer
    return Buffer.from(response.data);
  } catch (error) {
    // Handle any errors that occur during the download
    logger.error(error);
    throw new Error("Error downloading the image: " + error.message);
  }
}

async function resizeImageToThumbnail(imageBuffer) {
  try {
    // Use the 'Jimp' library to resize the image to a thumbnail
    const image = await Jimp.read(imageBuffer);
    await image.resize(100, 100).quality(90);
    return image.getBufferAsync(Jimp.MIME_JPEG);
  } catch (error) {
    logger.info(error);
    throw new Error("Error while creating a buffer");
  }
}
