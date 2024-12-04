const { v4: uuidv4 } = require("uuid");
const { docClient } = require("../config/dbConfig");

const TheaterModel = {
  createTheater: async (theaterData) => {
    const params = {
      TableName: "Movies",
      Item: theaterData,
    };

    return docClient.put(params).promise();
  },

  addShowToTheater: async (theaterId,movieId,showTime,availableSeats,screen,showId) => {
    //   const showId = uuidv4();  //generate uniqure showID
    console.log(theaterId,'---====')
    console.log(movieId,'---====')
    const params = {
      TransactItems: [
        {
          Put: {
            TableName: "Movies",
            Item: {
              PK: theaterId,
              SK: `${movieId}ShowId#${showId}`,
              Entity: "SHOW",
              ShowID: showId,
              TheaterId: theaterId,
              MovieId: movieId,
              ShowTime: showTime,
              AvailableSeats: availableSeats,
              Screen: screen,
              Status: "scheduled",
            },
            ConditionExpression: "attribute_not_exists(ShowTime)",
          },
        },
        {
            Update :{
                TableName: "Movies",
                Key : {
                    PK : theaterId,
                    SK: "MetaData"
                } ,
                UpdateExpression : "SET Shows = list_append(if_not_exists(Shows, :emptyList), :newShow)" ,
                // ExpressionAttributeNames: {
                //     "#shows": "Shows",
                //   },
                  ExpressionAttributeValues: {
                    ":newShow": [showId],
                    ":emptyList": [],
                  },  
            }
        }
      ],
    };
    return docClient.transactWrite(params).promise();
  },

  getTheaterShows: async (theaterId) => {
    const params = {
      TableName: "Movies",
      KeyConditionExpression: "PK = :theaterId",
      ExpressionAttributeValues: { ":theaterId": theaterId },
    };
    return docClient.query(params).promise();
  },

  // getShowDetails: async (theaterId, showId) => {
  //   console.log(theaterId, showId);

  //   const params = {
  //       TableName: "Movies",
  //       KeyConditionExpression: "PK = :theaterId", // Query by theater PK
  //       ExpressionAttributeValues: {
  //           ":theaterId": theaterId, // e.g., "THEATER#123"
  //       },
  //   };

  //   try {
  //       // Query to fetch theater details (which includes shows)
  //       const result = await docClient.query(params).promise();
        
  //       if (result.Items.length > 0) {
  //           // Assuming the "Shows" array is part of the result (e.g., in "result.Items[0].Shows")
  //           const theater = result.Items[0];
  //           console.log(theater,'-+-=');
  //           // Filter the shows array to find the show with the specified showId
  //           const showDetails = theater.Shows.find(show => show.showId === showId);
            
  //           if (showDetails) {
  //               return showDetails; // Return the found show details
  //           } else {
  //               return null; // Return null if showId is not found
  //           }
  //       }
        
  //       return null; // Return null if no theater is found

  //   } catch (error) {
  //       console.error("Error fetching show details:", error);
  //       throw error;
  //   }
  // },



};

module.exports = TheaterModel;
