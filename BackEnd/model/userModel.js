const { docClient, dynamoDB } = require("../config/dbConfig");

const UserModel = {
  createUser: async (userData) => {
    // console.log('inside model+++++++', userData);
    const params = {
      TableName: "Movies",
      Item: userData,
      ConditionExpression: "attribute_not_exists(PK)",
    };
    return await docClient.put(params).promise();
  },

  loginUser: async (email) => {
    const params = {
      TableName: "Movies",
      Key: {
        PK: `USER#${email}`,
        SK: "METADATA",
      },
    };

    try {
      const result = await docClient.get(params).promise();

      if (!result || !result.Item) {
        //  the case where no user is found
        return {
          success: false,
          statusCode: 404,
          message: "User not found.",
        };
      }

      // User found
      return {
        success: true,
        statusCode: 200,
        data: result.Item,
      };
    } catch (error) {
      console.error("Error querying DynamoDB (loginUser):", error);
      return {
        success: false,
        statusCode: 500,
        message: "An error occurred while retrieving the user.",
        errorDetails: error.message,
      };
    }
  },

  getUser: async (userId) => {
    // console.log(userId, '------------------');
    const params = {
      TableName: "Movies",
      Key: {
        PK: userId,
        SK: "METADATA",
      },
    };
    const result = await docClient.get(params).promise();
    if (result && result.Item) {
      console.log("get req res , ", result.Item);
      return result.Item;
    } else {
      console.log("error is getting user");
    }
  },

  updateUser: async (
    userId,
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames
  ) => {
    console.log("----", userId);
    console.log("----++", updateExpression);
    console.log("----", expressionAttributeValues);
    const params = {
      TableName: "Movies",
      Key: { PK: userId, SK: "METADATA" },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
    };

    return docClient.update(params).promise();
  },

  deleteUser: async (userId) => {
    const params = {
      TableName: "Movies",
      Key: { PK: userId, SK: "METADATA" },
    };

    return docClient.delete(params).promise();
  },
};

module.exports = UserModel;
