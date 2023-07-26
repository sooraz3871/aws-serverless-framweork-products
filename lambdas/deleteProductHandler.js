const AWS = require("aws-sdk");
const logger = require("../utils/logger");

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.PRODUCTS_TABLE;
const bucketName= process.env.PRODUCTS_BUCKET

module.exports.deleteProduct = async (event) => {
  try {
    const productId = event.pathParameters.productId;

    
    const params = {
      TableName: tableName,
      Key: { productId },
    };

    // Check if the item with the specified productId exists before attempting to delete
    const result = await dynamoDB.get(params).promise();
    const product = result.Item;

    if (!product) {
      throw new Error("No item with the specified productId found");
    }
    const objectKey = product?.productId;
    
    const s3Params = {
      Bucket: bucketName,
      Key: objectKey,
    };

    const deleteProductFromTableResponse =  dynamoDB.delete(params).promise();
    const deleteObjectResponse =  s3.deleteObject(s3Params).promise();
    
    await Promise.all([deleteObjectResponse, deleteProductFromTableResponse])

    const responseBody = {
      status: "success",
      message: "deleted",
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
    "Access-Control-Allow-Headers" : "Content-Type",
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