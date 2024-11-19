
const MovieModel = require('../model/movieModel');

//create Movie

exports.createMovie = async (req , res)=>{
    const {name, description , genre, cast , director, producer , rating , releaseDate} = req.body;

    if(!name || !description || !genre || !cast || !director || !producer || !rating || !releaseDate){
        return res.status(400).json({message : "Missing required Fields."});
    }

    const movieId = `Movies#${Date.now()}`;
    const movieData = {
        PK : movieId,
        SK : METADATA,
        Entity : 'MOVIE',
        movieId,
        Name : name,
        Description : description,
        Genre: genre,
        Cast : cast,
        Director : director,
        Producer : producer,
        Rating : rating,
        ReleaseDate : releaseDate,
    };

    try{
        await MovieModel.createMovie(movieData);
        res.status(201).json({movieId , message : 'Movie Created Successfully'});
    }
    catch(err){
        console.log("Error in creating movie " , err);
        res.status(201).json({movieId , message : 'Movie Created Successfully'});
    }
};

//fetch movie details

exports.getMovieDetails = async(req , res)=>{
    const {movieName} = req.params;

    try{
        const data = await MovieModel.getMovieByName(movieName);

        if(!data.items || data.items.length === 0){
            return res.status(404).json({message : 'Movie Not Found'});
        }
    }
    catch(err){
        console.log("Error in fetching movie " , err);
        res.status(500).json({message : 'Error fetching movie details'});
    }
}


//fetcch all movies
exports.getAllMovies = async(req, res)=>{
    // const movieId = req.params
    try{
        const data = await MovieModel.getAllMovies();
        res.status(200).json({message : 'Error fetching movies'});

    }
    catch(err){
        console.log("Error fetching all movies", err);
        res.status(500).json({message : "Error fetching movies"});
    }
};


// filter movies by genre
exports.filterByGenre = async(req , res)=>{
    const genre = req.query;

    try{
        const data = await MovieModel.filterMoviesByGenre(genre);
        res.status(200).json(data.items);
    }
    catch(err){
        console.log("Error in fetching movie by genre" , err);
        res.status(500).json({message : "Error in fetching movie by genre"});

    }
};


