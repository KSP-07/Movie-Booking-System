
const {v4 : uuidv4} = require('uuid');
const {docClient} = require('../config/dbConfig');

const TheaterModel = {
    createTheater : async (theaterData)=>{
        const params = {
            TableName : 'Movies',
            Item : theaterData
        };

        return docClient.put(params).promise();
    },

    addShowToTheater : async(theaterId, movieId, showTime, availableSeats, screen)=>{
      const showId = uuidv4();  //generate uniqure showID
      const params = {
        TableName : 'Movies',
        Item : {
            PK : `theater#${theaterId}`,
            SK : `Movie#${movieId}#Showtime#${showTime}`,
            Entity : "Show",
            showId,
            theaterId,
            movieId,
            showTime,
            availableSeats,
            screen,
            status : "scheduled"
        }
      } ;
      return docClient.put(params).promise(); 
    },

    getTheaterShows : async(theaterId)=>{
        const params = {
            TableName : 'Movies',
            KeyConditionExpression : 'PK = :theaterId',
            ExpressionAttributeValues : {':theaterId' : theaterId},
        };
        return docClient.query(params).promise();
    }


}