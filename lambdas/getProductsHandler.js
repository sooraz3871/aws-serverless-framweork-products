const AWS = require("aws-sdk");
const logger = require("../utils/logger");
const {generateSignedURL}= require("../methods/getSignedURLS3")

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.PRODUCTS_TABLE;
const bucketName = process.env.PRODUCTS_BUCKET;

module.exports.getProducts = async (event) => {
  try {
    const params = {
      TableName: tableName,
    };

    const result = await dynamoDB.scan(params).promise();
    const products = result.Items;

    for (const product of products) {
      // const imageURL = product?.imageURL;
      const key= product?.productId
      const signedURL = await generateSignedURL(bucketName, key);
      product.imageURL = signedURL; // Add the signed URL to the product object
    }

    responseBody = {
      status: "success",
      data: products,
    };
    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
    };
  } catch (error) {
    logger.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
