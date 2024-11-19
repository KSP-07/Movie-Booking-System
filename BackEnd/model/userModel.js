
const {docClient, dynamoDB} = require('../config/dbConfig');;

const UserModel = {
    createUser : async (userData) =>{
        const params = {
            TableName : 'Movies',
            Item : userData,
        };
        return docClient.put(params).promise();
    },

    loginUser : async(email)=>{
        const params = {
            TableName : 'Movies',
            IndexName : "EmailIndex",  //make sure to create a gsi
            KeyConditionExpression : "email = :email",
            ExpressionAttributeValues : {
                ":email" : email,
            }
        }

        const result = await dynamoDB.query(param).promise();
        return result.Items[0];   //Return the first user found
    },

    getUser : async (userId)=>{
        const params = {
            TableName : "Movies",
            Key : {
                PK : userId,
                SK : 'METADATA'
            }
        };
        return docClient.get(params).promise();
    },

    updateUser : async(userId , updateExpression, expressionAttributeValues)=>{
        const params = {
            TableName : 'Movies',
            Key : {PK : userId , SK : 'METADATA'},
            updateExpression : updateExpression,
            ExpressionAttributeValues : expressionAttributeValues,
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