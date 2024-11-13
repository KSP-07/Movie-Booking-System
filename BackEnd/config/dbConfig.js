
const AWS = require('aws-sdk');


AWS.config.update({
    region : process.env.REGION,
    accessKeyId : process.env.ACCESSKEY,
    secretAccessKeyId : process.env.SECRETKEY,
    endpoint : process.env.ENDPOINT
});

const dynamoDB = AWS.DynamoDB();
const docClient = AWS.DynamoDB.DocumentClient();


module.exports = {
    dynamoDB,
    docClient
}