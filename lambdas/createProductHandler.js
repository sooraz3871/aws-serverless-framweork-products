const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const logger = require("../utils/logger");
const { triggerEvent } = require("../methods/sendToEventBridge");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.PRODUCTS_TABLE;


module.exports.createProduct = async (event) => {
  try {
    if (!JSON.parse(event.body))
      throw new Error("Missing required product attributes");
    logger.info(JSON.parse(event.body));
    const { name, description, price, imageURL } = JSON.parse(event.body);

    await validateProductAttributes(name, description, price, imageURL);

    const product = {
      productId: uuidv4(),
      name,
      description,
      price,
      imageURL,
    };

    const eventBridgeResponse = await triggerEvent(product);

    if (!eventBridgeResponse) {
      throw Error("Event Bridge Error");
    }

    product.imageURL = `https://${process.env.PRODUCTS_BUCKET}.s3-${process.env.REGION}.amazonaws.com/${product.productId}`; // product image url to map to s3 image

    const params = {
      TableName: tableName,
      Item: product,
    };

    await dynamoDB.put(params).promise(); //save product to products table

    const responseBody = {
      status: "success",
      message: "created"
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

/**
 * Function validate Product Attributes
 * @author   Suraj
 * @param    {String} name
 * @param    {String} description
 * @param    {String} imageURL
 * @param    {Number} price
 * @return   Error if valiation error occurs
 */

const validateProductAttributes = async (
  name,
  description,
  price,
  imageURL
) => {
  if (!name || !description || !price || !imageURL) {
    throw new Error("Missing required product attributes.");
  }

  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof price !== "number"
  ) {
    throw new Error(
      "Invalid product attributes. Name and description must be strings, and price must be a number."
    );
  }

  if (price <= 0) {
    throw new Error("Price must be a positive number.");
  }

  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"]; //valid MIME types

  const axiosResponse = await axios.get(imageURL, {
    responseType: "arraybuffer",
  });
  const contentType = axiosResponse.headers["content-type"];

  if (!allowedMimes.includes(contentType)) {
    throw new Error("Invalid Image Type of the provided URL");
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