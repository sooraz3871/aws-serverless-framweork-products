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

    const responseBody = {
      status: "success",
      data: products,
    };
    const response = buildResponse(200, responseBody);
    return response

  } catch (error) {

    console.error("Error creating product:", error);
    const errorResponseData = { error: 'An error occurred', message: error.message };
    const errorResponse = buildResponse(500, errorResponseData);

    return errorResponse;
  }
};


const buildResponse=(statusCode,data)=>{

  const headers = {
    'Access-Control-Allow-Origin': '*',
    "content-type" : "application/json",
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
  };

  // Construct the response
  const response = {
    statusCode,
    headers,
    body: JSON.stringify(data),
  };

  return response;
 
}
