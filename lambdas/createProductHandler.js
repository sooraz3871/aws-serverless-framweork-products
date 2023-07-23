const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { triggerEvent } = require("../methods/sendToEventBridge");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.PRODUCTS_TABLE;



const validateProductAttributes = (name, description, price, image_url) => {
  if (!name || !description || !price || !image_url) {
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
};

module.exports.createProduct = async (event) => {
  try {
    if (!JSON.parse(event.body))
      throw new Error("Missing required product attributes");
    logger.info(JSON.parse(event.body));
    const { name, description, price, imageURL } = JSON.parse(event.body);
    validateProductAttributes(name, description, price, imageURL);

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
    product.imageURL=`https://${process.env.PRODUCTS_BUCKET}.s3.amazonaws.com/${product.productId}` // product image url to map to s3 image

    const params = {
      TableName: tableName,
      Item: product,
    };

    await dynamoDB.put(params).promise(); //save product to products table


    responseBody = {
      status: "success",
      message: "created",
      data: product,
    };

    return {
      statusCode: 201,
      body: JSON.stringify(responseBody),
    };

  } catch (error) {
    console.error("Error creating product:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
