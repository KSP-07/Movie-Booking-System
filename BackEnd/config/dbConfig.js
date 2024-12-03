
require('dotenv').config();
const AWS = require('aws-sdk');


AWS.config.update({
    region : process.env.REGION,
    accessKeyId : process.env.ACCESSKEY,
    secretAccessKeyId : process.env.SECRETKEY,
    endpoint : process.env.ENDPOINT
});

const dynamoDB = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();



const getItem = async () => {
    const params = {
      TableName: 'Movies', 
      Key: {
        PK: 'Movies#3a90fd9a-e078-42a6-a015-f7da28ea79fa',
        SK: 'METADATA', // The SK value you want to query for
      },
    };
  
    try {
      const data = await docClient.get(params).promise();
      console.log('Item fetched:', data.Item);
    } catch (error) {
      console.error('Error fetching item:', error); 
    }
  };
  
  // getItem();
  

module.exports = {
    dynamoDB,
    docClient
}