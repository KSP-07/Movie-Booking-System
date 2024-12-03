
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
        // console.log(movieName,'++++++++++')
        const params = {
            TableName : 'Movies',
            IndexName: 'MovieNameIndex',
            KeyConditionExpression: 'Entity = :entity AND MovieName = :movieName',
            ExpressionAttributeValues: {
              ':entity': 'MOVIE',
              ':movieName': movieName,
            },
        };

        const result = await docClient.query(params).promise();
        // console.log(result.Items);
        return result;
    },


    getAllMovies : async(ReleaseDate)=>{
        // console.log(ReleaseDate,'---=====');
        const params = {
            TableName : 'Movies',
            IndexName : 'MovieReleaseDateIndex',
            KeyConditionExpression : 'Entity = :entity AND begins_with(ReleaseDate, :releaseDate)',
            ExpressionAttributeValues : {
                ':entity' : 'MOVIE',
                ':releaseDate' : ReleaseDate,
            },
            ScanIndexForward: false, 
        };

        return docClient.query(params).promise();
    },


    filterMoviesByGenre : async(genre)=>{
        console.log(typeof genre,'-------------');
        const params = {
            TableName : 'Movies',
            FilterExpression : 'contains(Genre , :genre)',
            ExpressionAttributeValues : {':genre' : genre}
        };

        return  docClient.scan(params).promise();
    }

};

module.exports = MovieModel;