const AWS = require("aws-sdk");
const Jimp = require("jimp");
const axios = require("axios");

const logger = require("../utils/logger");

const s3 = new AWS.S3();

module.exports.convertToThumbnail = async (event) => {
  try {
    logger.info(event);

    const { bucketName, imageURL, thumbnailKey } = event?.detail;

    // Download the image from the URL
    const imageBuffer = await downloadImage(imageURL);

    // Resize the image to a thumbnail
    const thumbnailBuffer = await resizeImageToThumbnail(imageBuffer);

    // Upload the thumbnail to the S3 bucket
    const params = {
      Bucket: bucketName,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: "image/jpeg"
    };

    await s3.putObject(params).promise();
    logger.info("Converted and Saved")

  } catch (error) {
    logger.error("Error converting to thumbnail:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error converting to thumbnail" }),
    };
  }
};

/**
 * Function to download image from the given URL
 * @author   Suraj
 * @param    {String} imageURL    URL of the image
 * @return   Image Buffer
 */

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

/**
 * Function to convert the image to Thumbnail
 * @author   Suraj
 * @param    Image Buffer
 * @return   Converted Image
 */

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
