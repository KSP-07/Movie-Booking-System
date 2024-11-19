
const {docClient} =  require('../config/dbConfig');

const MovieModel = {
    createMovie : async (movieData)=>{
        const params = {
            TableName : 'Movies',
            Item : movieData,   
        };
        return docClient.put(params).promise();
    },


    getMovieByName : async(movieName)=>{
        const params = {
            TableName : 'Movies',
            IndexName: 'MovieNameIndex',
            KeyConditionExpression: 'PK = :pk AND Movie#MovieName = :movieName',
            ExpressionAttributeValues: {
              ':pk': 'MOVIE',
              ':movieName': movieName,
            },
        };

        return docClient.query(params).promise();
    },


    getAllMovies : async()=>{
        const params = {
            TableName : 'Movies',
            IndexName : 'ReleaseDateIndex'
        };

        return docClient.scan(params).promise();
    },


    filterMoviesByGenre : async(genre)=>{
        const params = {
            TableName : 'Movies',
            IndexName : 'GenreIndex',
            KeyConditionExpression : 'Genre = :genre',
            ExpressionAttributeValues : {':genre' : genre}
        };

        return  docClient.query(params).promise();
    }

};

module.exports = MovieModel;