const AWS = require("aws-sdk");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.PRODUCTS_TABLE;

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

    await dynamoDB.delete(params).promise();

    responseBody = {
      status: "success",
      message: "deleted",
    };
    return {
      statusCode: 200,
      body: JSON.stringify({ responseBody }),
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
