const { dynamoDB } = require("../config/dbConfig")

const params = {
    TableName : "Movies",
    KeySchema : [
        {AttributeName : "PK" , KeyType :'HASH' },
        {AttributeName : "SK" , KeyType : "RANGE"}
    ],
    AttributeDefinitions :[
        {AttributeName : "PK" , AttributeType : "S"},
        {AttributeName : "SK" , AttributeType :  "S"},
        {AttributeName : "ReleaseDate" , AttributeType : "S"},
        {AttributeName : "BookingDate" , AttributeType : "S"},   
        { AttributeName: "Entity", AttributeType: "S" },  //for GSI
        {AttributeName : "MovieName" , AttributeType : "S"},
        {AttributeName : "ShowId" , AttributeType : "S"},
        // {AttributeName : "Email" , AttributeType : "S"}
    ],
    GlobalSecondaryIndexes : [
        {
            IndexName : "MovieReleaseDateIndex",
            KeySchema : [
                { AttributeName: "Entity", KeyType: "HASH" }, 
                {AttributeName : "ReleaseDate" , KeyType : "RANGE"}
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
                { AttributeName: "Entity", KeyType: "HASH" }, 
                {AttributeName : "MovieName" , KeyType : "RANGE"}
            ],
            Projection :{ProjectionType : "ALL"},
            ProvisionedThroughput : {
                ReadCapacityUnits : 5,
                WriteCapacityUnits : 5,
            }
        },
        // {
        //     IndexName: "EmailIndex", // New GSI for Email
        //     KeySchema: [
        //       { AttributeName: "PK", KeyType: "HASH" },  // Use PK as HASH key
        //       { AttributeName: "Email", KeyType: "RANGE" } // Use Email as RANGE key
        //     ],
        //     Projection: { ProjectionType: "ALL" }, // Include all attributes in the index   
        //     ProvisionedThroughput: {
        //       ReadCapacityUnits: 5, 
        //       WriteCapacityUnits: 5
        //     }
        //   } 
    ],
    LocalSecondaryIndexes :[
        {
            IndexName : "BookingDateIndex",
            KeySchema : [
                {AttributeName : "PK" , KeyType : "HASH"},
                {AttributeName : "BookingDate" ,KeyType : "RANGE"}
            ],
            Projection : {ProjectionType : "ALL"}     
        },
        {
            IndexName : "ShowDetails",
            KeySchema : [
                {AttributeName : "PK" , KeyType : "HASH"},
                {AttributeName : "ShowId" ,KeyType : "RANGE"}
            ],
            Projection : {ProjectionType : "ALL"}     
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