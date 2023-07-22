const AWS = require("aws-sdk");
const logger = require("../utils/logger");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.PRODUCTS_TABLE;

module.exports.getProducts = async (event) => {
  try {
    const params = {
      TableName: tableName,
    };

    const result = await dynamoDB.scan(params).promise();
    const products = result.Items;

    responseBody = {
      status: "success",
      data: products,
    };
    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
    };
  } catch (error) {
    console.error("Error getting products:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
