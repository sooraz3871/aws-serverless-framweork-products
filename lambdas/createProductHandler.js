const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.PRODUCTS_TABLE;

const validateProductAttributes = (name, description, price) => {
  if (!name || !description || !price) {
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
    logger.info(JSON.parse(event.body));
    const { name, description, price } = JSON.parse(event.body);

    validateProductAttributes(name, description, price);

    const product = {
      productId: uuidv4(),
      name,
      description,
      price,
    };

    const params = {
      TableName: tableName,
      Item: product,
    };

    await dynamoDB.put(params).promise();

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
