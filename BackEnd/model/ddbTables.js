const { dynamoDB } = require("../config/dbConfig")

const params = {
    TableName : "Movies",
    KeySchema : [
        {AttributeName : "PK" , KeyType :'HASH' },
        {AttributeName : "SK" , KeyType : "RANGE"}
    ],
    AttributeDefinitions :[
        {AttributeNmae : "PK" , AttributeType : "HASh"},
        {AttributeName : "SK" , AttributeType :  "RANGE"},
        {AttributeName : "ReleaseDate" , AttributeType : "S"},
        {AttributeName : "BookingDate" , AttributeType : "S"},   
        {AttributeName : "BookingDate" , AttributeType : "S"},   
    ],
    GlobalSecondaryIndexes : [
        {
            IndexName : "MovieReleaseDateIndex",
            KeySchema : [
                {AttributeName : "PK" , KeyType : "HASH"},
                {AttributeName : "Movie#ReleaseDate" , KeyType : "RANGE"}
            ],
            Projection :{ProjectionType : "ALL"},
            ProvisionedThroughput : {
                ReadCapacityUnits : 5,
                WriteCapacityUnits : 5,
            }
        },
        {
            IndexName : "MovieNameIndex",
            KeySchema : [
                {AttributeName : "PK" , KeyType : "HASH"},
                {AttributeName : "Movie#MovieName" , KeyType : "RANGE"}
            ],
            Projection :{ProjectionType : "ALL"},
            ProvisionedThroughput : {
                ReadCapacityUnits : 5,
                WriteCapacityUnits : 5,
            }
        },
    ],
    LocalSecondaryIndex :[
        {
            IndexName : "BookingDateIndex",
            KeySchema : [
                {AttributeName : "PK" , KeyType : "HASH"},
                {AttributeName : "Booking#BookingDate" ,KeyType : "RANGE"}
            ]     
        }
    ],
    ProvisionedThroughput :{
        ReadCapacityUnits : 5, 
        WriteCapacityUnits : 5,
    }
}




const createTable = async ()=>{
    try{
        const result = await dynamoDB.createTable(params).promise();
        console.log("Table Created Successfully: " , result);
    }
    catch(err){
        console.error("Error creating table " , err);
    }

}

createTable();