const {
  EventBridgeClient,
  PutEventsCommand,
} = require("@aws-sdk/client-eventbridge");
const logger = require("../utils/logger");

module.exports.triggerEvent = async (product) => {
  try {
    const ebClient = new EventBridgeClient();

    const details = {
      bucketName: process?.env?.PRODUCTS_BUCKET,
      imageURL: product?.imageURL,
      thumbnailKey: product?.productId,
    };
    const detailString = JSON.stringify(details);
    const input = {
      Entries: [
        {
          Time: new Date("TIMESTAMP"),
          Source: "custom.createProduct",
          DetailType: "CreateProductEvent",
          Detail: detailString,
          EventBusName: "default",
        },
      ],
    };
    const command = new PutEventsCommand(input);
    const ebResponse = await ebClient.send(command);
    logger.info(ebResponse);

    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};
