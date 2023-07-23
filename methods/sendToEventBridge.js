
const {EventBridgeClient,PutEventsCommand} = require("@aws-sdk/client-eventbridge")
const logger = require("../utils/logger");

module.exports.triggerEvent = async (product) => {
  try {

    const ebClient = new EventBridgeClient();

    const details={
      bucketname:process.env.BUCKET_NAME,
      image_url:product.image_url
    }
    const detailString = JSON.stringify(details);
    const input = {
      // PutEventsRequest
      Entries: [
        // PutEventsRequestEntryList // required
        {
          // PutEventsRequestEntry
          Time: new Date("TIMESTAMP"),
          Source: "custom.createProduct",
          DetailType: "CreateProductEvent",
          Detail: detailString,
          EventBusName: "default",
        },
      ],
      // EndpointId: "STRING_VALUE",
    };
    const command = new PutEventsCommand(input);
    const ebResponse= await ebClient.send(command);
    logger.info(ebResponse)
    
    return true;
  } catch (error) {
    logger.error(error)
    return false;
  }
};