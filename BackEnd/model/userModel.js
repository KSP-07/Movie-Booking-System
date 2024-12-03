
const {docClient, dynamoDB} = require('../config/dbConfig');;

const UserModel = {
    createUser : async (userData) =>{
        // console.log('inside model+++++++', userData);
        const params = {
            TableName : 'Movies',
            Item : userData,
            ConditionExpression: "attribute_not_exists(PK)",
        };
        return docClient.put(params).promise();
    },

    loginUser : async(email)=>{
        // console.log("----------email-----" , email , typeof email);
        const params = {
            TableName : 'Movies',
            Key : {
                PK : `USER#${email}`,
                SK : 'METADATA'
            }
        };

        try {
            // console.log('=====');
            const result = await docClient.get(params).promise();
            // console.log('=====+++++');
             
             // Log the result for debugging
            // console.log('Query result:', result);
            // Check if results were returned
            if (result && result.Item) {
                console.log("Returning user data:", result.Item);
                return result.Item; // Return the actual item
    
            } else {
              throw new Error('No items found for the provided email');
            }
          } catch (error) {
            console.error("Error querying DynamoDB:(userModel) ", error);
            throw new Error("Error querying the database.");
          }
          
    },

    getUser : async (userId)=>{
        // console.log(userId, '------------------');
        const params = {
            TableName : "Movies",
            Key : {
                PK : userId,
                SK : 'METADATA'
            }
        };
        const result = await docClient.get(params).promise();
        if(result && result.Item){
            console.log('get req res , ' , result.Item);
            return result.Item;

        }
        else{
            console.log("error is getting user");
        }
    },

    updateUser : async(userId , updateExpression, expressionAttributeValues, expressionAttributeNames)=>{
        console.log('----',userId );
        console.log('----++',updateExpression );
        console.log('----',expressionAttributeValues );
        const params = {
            TableName : 'Movies',
            Key : {PK : userId , SK : 'METADATA'},
            UpdateExpression : updateExpression,
            ExpressionAttributeValues : expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
        };

        return docClient.update(params).promise();
    },

    deleteUser : async(userId)=>{
        const params = {
            TableName : 'Movies',
            Key : {PK : userId , SK : 'METADATA'},
        };

        return docClient.delete(params).promise();
    }
};


module.exports = UserModel;