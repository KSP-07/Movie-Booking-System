const { docClient } = require("../config/dbConfig");

const BookingModel = {
  createBooking: async (bookingData) => {
    const params = {
      TableName: "Movies",
      Item: bookingData,
    };

    return docClient.put(params).promise();
  },

  //get booking by booking id
  getBooking: async (userId, bookingId) => {

    // console.log(userId ,'\n' , bookingId,'-----=');
    const params = {
      TableName: "Movies",
      Key: {
        PK: userId,
        SK: bookingId,
      },
    };
    const result = await docClient.get(params).promise();
    return result.Item;
  },

  //fetch all booking with pagination
  getBookings: async (userId, limit, startKey) => {
    console.log(userId , limit , startKey,'====');
    const params = {
      TableName: "Movies",
      KeyConditionExpression:
        `PK = :userId AND begins_with(SK, :bookingPrefix)`,
      ExpressionAttributeValues: {
        ":userId": userId,
        ":bookingPrefix": "BOOKING#",
      },
      Limit: limit,
      ExclusiveStartKey: startKey,
    };

    return docClient.query(params).promise();
  },

  //fetch bookings by status
  getBookingsByStatus: async (userId, status) => {
    const params = {
        TableName : "Movies",
        KeyConditionExpression : 'PK = :pk AND begins_with(SK, :prefix)',
        FilterExpression : '#status = :status',
        ExpressionAttributeNames : {
            '#status': 'Status'
        },
        ExpressionAttributeValues : {
            ':pk' : userId,
            ':prefix' : 'BOOKING#',
            ':status' : status,
        }
    };
    const result = await docClient.query(params).promise();
    return result.Items;
  },

//get upcoming bookings filtered by status 
getUpcomingBookings: async (userId, currentTime) => {
  // console.log('dfdfsdfsdfsd' , userId ,'    777777    ', currentTime);
  const params = {
    TableName: "Movies",
    IndexName: "BookingDateIndex", 
    KeyConditionExpression: 'PK = :pk AND BookingDate >= :currentTime',
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: {
        '#status': 'Status',
    },
    ExpressionAttributeValues: {
        ':pk': userId,
        ':currentTime': currentTime,
        ':status': 'confirmed',
    },
};
    const result = await docClient.query(params).promise();
    // console.log("upcoming BOokins ," , result);
    return result.Items;
  },



  //cancel a booking
  cancelBooking : async(userId, bookingId)=>{
    const params = {
        TableName : 'Movies',
        Key: {
            PK : userId,
            SK : bookingId,
        },

        UpdateExpression : 'SET #status = :cancelled',
        ExpressionAttributeNames :{
          "#status" : "Status"
        },
        ExpressionAttributeValues : {
            ':cancelled' : 'Cancelled',
        },
    };

    return await docClient.update(params).promise();
    
  },

  getShowDetails : async(pk, sk)=>{
    const params = {
      TableName : 'Movies',
      Key :{
        PK : pk,
        SK : sk,
      }
    }
    const result = await docClient.get(params).promise();
    // console.log(result,'----====')
    return result;
  },


  updateShowSeats: async (pk,sk, newAvailableSeats) => {
    const params = {
        TableName: "Movies",
        Key: {
            PK: pk,
            SK: sk,
        },
        UpdateExpression: `SET AvailableSeats = :newSeats`,
        ExpressionAttributeValues: {
            ":newSeats": newAvailableSeats,
        },
        ReturnValues: "UPDATED_NEW",
    };
  
    const result = await docClient.update(params).promise();
    return result;
  },

};

module.exports = BookingModel;
