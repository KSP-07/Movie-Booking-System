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
    const params = {
      TableName: "Movies",
      Key: {
        PK: `USER#${userId}`,
        SK: bookingId,
      },
    };
    const result = await docClient.get(params).promise();
    return result.Item;
  },

  //fetch all booking with pagination
  getBookings: async (userId, limit, startKey) => {
    const params = {
      TableName: "Movies",
      KeyConditionExpression:
        'PK = "userId AND begins_with(SK, :bookingPrefix)',
      ExpressionAttributeValues: {
        ":userId": userId,
        ":bookingPrefix": "Booking#",
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
            ':pk' : `USER#${userId}`,
            ':prefix' : 'Booking#',
            ':status' : status,
        }
    };
    const result = await docClient.query(params).promise();
    return result.Items;
  },
  //cancel a booking
  cancelBooking : async(userId, bookingId)=>{
    const params = {
        TableName : 'Movies',
        Key: {
            PK : `USER#${userId}`,
            SK : bookingId,
        },

        UpdateExpression : 'SET #status = :cancelled',
        ExpressionAttributeValues : {
            ':cancelled' : 'Cancelled',
        },
    };

    await docClient.query(params).promise();
    
  },


};

module.exports = BookingModel;
