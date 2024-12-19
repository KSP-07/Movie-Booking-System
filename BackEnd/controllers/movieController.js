// const { v4: uuidv4 } = require("uuid");

// const MovieModel = require("../model/movieModel");

// //create Movie
// exports.createMovie = async (req, res) => {
//   const {
//     name,
//     description,
//     genre,
//     cast,
//    director,
//     producer,
//     rating,
//     releaseDate,
//   } = req.body;

//   console.log(req.body);
//   if (
//     !name ||
//     !description ||
//     !genre ||
//     !cast ||
//     !director ||
//     !producer ||
//     !releaseDate
//   ) {
//     return res.status(400).json({ message: "Missing required Fields." });
//   }

//   const movieId = `MOVIES#${uuidv4()}`;
//   const movieData = {
//     PK: movieId,
//     SK: "METADATA",
//     Entity: "MOVIE",
//     MovieName: name,
//     Description: description,
//     Genre: genre,
//     Cast: cast,
//     Director: director,
//     Producer: producer,
//     Rating: rating,
//     ReleaseDate: releaseDate,
//   };

//   try {
//     await MovieModel.createMovie(movieData);
//     return res
//       .status(201)
//       .json({ movieId, message: "Movie Created Successfully" });
//   } catch (err) {
//     console.log("Error in creating movie ", err);
//     return res
//       .status(400)
//       .json({ movieId, message: "Error in creating Movie." });
//   }
// };

// //fetch movie details by name
// exports.getMovieDetails = async (req, res) => {
//   const { movieName } = req.params;
//   // console.log(movieName,'++++++++++')
//   if (!movieName) {
//     return res.status(400).json({ message: "Movie name is not provided." });
//   }
//   try {
//     const data = await MovieModel.getMovieByName(movieName);
//     // console.log('--======', data.Items);
//     if (!data.Items || data.Items.length === 0) {
//       return res.status(404).json({ message: "Movie Not Found" });
//     } else {
//       const response = data.Items[0];
//       // return res.status(200).json({movie, message : "Movie found successfully."})
//       return res.status(200).json({
//           response,
//         message: "Movie Found",
//       });
//     }
//   } catch (err) {
//     console.log("Error in fetching movie ", err);
//     return res.status(500).json({ message: "Error fetching movie details" });
//   }
// };

// //fetcch all movies by releaseDate
// exports.getSortedMovies = async (req, res) => {
//   // const movieId = req.params
//   const ReleaseDate = req.query.releaseDate;

//   // console.log(ReleaseDate,'---=====');
//   if (!ReleaseDate) {
//     try {
//         const data = await MovieModel.getAllMovies();
//         // let response;
//         if (data && data.Items && data.Items.length > 0) {
//           // console.log(data.Items);
//           const response = data.Items;
//           return res.status(200).json({ response, message: "Movie Found" });
//         } else {
//           return res.status(404).json({ message: "No Movie exist." });
//         }
//         // else return data;
//       } catch (err) {
//         console.log("Error fetching all movies", err);
//         return res.status(500).json({ message: "Error Fetching Movies" });
//       }
//     // return res.status(400).json({ message: "Release date is required" });
//   }

//   try {
//     const data = await MovieModel.getAllMoviesByDate(ReleaseDate);
//     // let response;
//     if (data && data.Items && data.Items.length > 0) {
//       // console.log(data.Items);
//       const response = data.Items;
//       return res.status(200).json({ response, message: "Movie Found" });
//     } else {
//       return res.status(404).json({ message: "No Movie exist." });
//     }
//     // else return data;
//   } catch (err) {
//     console.log("Error fetching all movies", err);
//     return res.status(500).json({ message: "Error Fetching Movies" });
//   }
// };

// // filter movies by genre
// exports.filterByGenre = async (req, res) => {
//   const { genre } = req.query; //using {} this becasue getting genre as a object so destructuring it.

//   if (!genre) {
//     return res.status(400).json({ message: "Genre not provided." });
//   }
//   try {
//     // console.log('455455')
//     const data = await MovieModel.filterMoviesByGenre(genre);
//     return res.status(200).json(data.Items);
//   } catch (err) {
//     console.log("Error in fetching movie by genre", err);
//     return res
//       .status(500)
//       .json({ message: "Error in fetching movie by genre" });
//   }
// };

const { v4: uuidv4 } = require("uuid");
const MovieModel = require("../model/movieModel");
const { redisCacheCall } = require("../utils/redisCalls"); 

// Cache expiry time in seconds (e.g., 1 hour)
const CACHE_EXPIRY = 3600;

// Create Movie
exports.createMovie = async (req, res) => {
  const {
    name,    description,    genre,    cast,    director,    producer,    rating,    releaseDate,  } = req.body;

// console.log("Req body is..." , req.body);
  if (!name || !description || !genre || !cast || !director || !producer || !releaseDate) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const movieId = `MOVIES#${uuidv4()}`;
  const movieData = {
    PK: movieId,
    SK: "METADATA",
    Entity: "MOVIE",
    MovieName: name,
    Description: description,
    Genre: genre,
    Cast: cast,
    Director: director,
    Producer: producer,
    Rating: rating,
    ReleaseDate: releaseDate,
  };

  try {
    // Create movie in the database
    await MovieModel.createMovie(movieData);

    // Invalidate cached movie list
    await redisCacheCall("del", "ALL_MOVIES");

    return res
      .status(201)
      .json({ movieId, message: "Movie Created Successfully" });
  } catch (err) {
    console.log("Error in creating movie ", err);
    return res
      .status(400)
      .json({ movieId, message: "Error in creating Movie." });
  }
};

// Fetch movie details by name
exports.getMovieDetails = async (req, res) => {
  const { movieName } = req.params;

  if (!movieName) {
    return res.status(400).json({ message: "Movie name is not provided." });
  }

  try {
    // Check Redis cache first
    const cacheKey = `Movie:${movieName}`;
    const cachedData = await redisCacheCall("get", cacheKey);

    if (cachedData) {
      return res.status(200).json({
        response: cachedData,
        message: "Movie found (from cache).",
      });
    }

    // Fetch from database if not in cache
    const data = await MovieModel.getMovieByName(movieName);

    if (!data.Items || data.Items.length === 0) {
      return res.status(404).json({ message: "Movie Not Found" });
    }

    const response = data.Items[0];

    // Cache the movie details
    await redisCacheCall("set", cacheKey, CACHE_EXPIRY, response);

    return res.status(200).json({
      response,
      message: "Movie Found",
    });
  } catch (err) {
    console.log("Error in fetching movie ", err);
    return res.status(500).json({ message: "Error fetching movie details" });
  }
};

// Fetch all movies by release date
exports.getSortedMovies = async (req, res) => {
  const ReleaseDate = req.query.releaseDate;

  try {
    const cacheKey = ReleaseDate
      ? `Movie:Sorted:${ReleaseDate}`
      : "ALL_MOVIES";

    // Check Redis cache first
    const cachedData = await redisCacheCall("get", cacheKey);

    if (cachedData) {
      return res.status(200).json({
        response: cachedData,
        message: "Movies found (from cache).",
      });
    }

    // Fetch from database if not in cache
    let data;
    if (ReleaseDate) {
      data = await MovieModel.getAllMoviesByDate(ReleaseDate);
    } else {
      data = await MovieModel.getAllMovies();
    }

    if (!data || !data.Items || data.Items.length === 0) {
      return res.status(404).json({ message: "No Movie exist." });
    }

    const response = data.Items;

    // Cache the movie list
    await redisCacheCall("set", cacheKey, CACHE_EXPIRY, response);

    return res.status(200).json({ response, message: "Movies Found" });
  } catch (err) {
    console.log("Error fetching movies", err);
    return res.status(500).json({ message: "Error Fetching Movies" });
  }
};

// Filter movies by genre
exports.filterByGenre = async (req, res) => {
  const { genre } = req.query;

  if (!genre) {
    return res.status(400).json({ message: "Genre not provided." });
  }

  try {
    // Check Redis cache first
    const cacheKey = `Movie:Genre:${genre}`;
    const cachedData = await redisCacheCall("get", cacheKey);

    if (cachedData) {
      return res.status(200).json({
        response: cachedData,
        message: "Movies found by genre (from cache).",
      });
    }

    // Fetch from database if not in cache
    const data = await MovieModel.filterMoviesByGenre(genre);

    if (!data || !data.Items || data.Items.length === 0) {
      return res
        .status(404)
        .json({ message: "No movies found for this genre." });
    }

    const response = data.Items;

    // Cache the filtered movies
    await redisCacheCall("set", cacheKey, CACHE_EXPIRY, response);

    return res.status(200).json(response);
  } catch (err) {
    console.log("Error in fetching movie by genre", err);
    return res
      .status(500)
      .json({ message: "Error in fetching movie by genre" });
  }
};
