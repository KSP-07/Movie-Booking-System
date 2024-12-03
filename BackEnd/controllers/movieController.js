
const {v4 : uuidv4} = require('uuid');

const MovieModel = require('../model/movieModel');

//create Movie
exports.createMovie = async (req , res)=>{
    const {name, description , Genre, Cast , Director, Producer , Rating , ReleaseDate} = req.body;

    console.log(req.body);
    if(!name || !description || !Genre || !Cast || !Director || !Producer || !Rating || !ReleaseDate){
        return res.status(400).json({message : "Missing required Fields."});
    }

    const movieId = `MOVIES#${uuidv4()}`;
    const movieData = {
        PK : movieId,
        SK : "METADATA",
        Entity : 'MOVIE',
        MovieName : name,
        Description : description,
        Genre: Genre,
        Cast : Cast,
        Director : Director,
        Producer : Producer,
        Rating : Rating,
        ReleaseDate : ReleaseDate,
    };

    try{
        await MovieModel.createMovie(movieData);
        res.status(201).json({movieId , message : 'Movie Created Successfully'});
    }
    catch(err){
        console.log("Error in creating movie " , err);
        res.status(400).json({movieId , message : 'Error in creating Movie.'});
    }
};

//fetch movie details
exports.getMovieDetails = async(req , res)=>{
    const {movieName} = req.params;
    // console.log(movieName,'++++++++++')
    if(!movieName){
        res.status(400).json({message : "Movie name is not provided."})
    }
    try{
        const data = await MovieModel.getMovieByName(movieName);
        // console.log('--======', data.Items);
        if(!data.Items || data.Items.length === 0){
            return res.status(404).json({message : 'Movie Not Found'});
        }
        else{
            const movie = data.Items[0];
            // return res.status(200).json({movie, message : "Movie found successfully."})
            return res.status(200).json({
                message: 'Movie Found',
                movie: {
                    name: movie.MovieName,
                    description: movie.Description,
                    genre: movie.Genre,
                    cast: movie.Cast,
                    director: movie.Director,
                    producer: movie.Producer,
                    rating: movie.Rating,
                    releaseDate: movie.ReleaseDate
                }
            });
        }
    }
    catch(err){
        console.log("Error in fetching movie " , err);
        res.status(500).json({message : 'Error fetching movie details'});
    }
} 


//fetcch all movies by releaseDate
exports.getSortedMovies  = async(req, res)=>{
    // const movieId = req.params
    const ReleaseDate = req.query.releaseDate;

    // console.log(ReleaseDate,'---=====');
    if (!ReleaseDate) {
        return res.status(400).json({ message: 'Release date is required' });
    }

    try{    
        const data = await MovieModel.getAllMovies(ReleaseDate);
        res.status(200).json({data, message : 'Movie Found'});

    }
    catch(err){
        console.log("Error fetching all movies", err);
        res.status(500).json({message : "Error Fetching Movies"});
    } 
};


// filter movies by genre
exports.filterByGenre = async(req , res)=>{
    const {genre} = req.query;   //using {} this becasue getting genre as a object so destructuring it.

    if(!genre) {
        res.status(400).json({message : "Genre not provided."});
    }
    try{
        const data = await MovieModel.filterMoviesByGenre(genre);
        res.status(200).json(data.Items);
    }
    catch(err){
        console.log("Error in fetching movie by genre" , err);
        res.status(500).json({message : "Error in fetching movie by genre"});

    }
};


