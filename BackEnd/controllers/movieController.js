const { v4: uuidv4 } = require("uuid");

const MovieModel = require("../model/movieModel");

//create Movie
exports.createMovie = async (req, res) => {
  const {
    name,
    description,
    genre,
    cast,
   director,
    producer,
    rating,
    releaseDate,
  } = req.body;

  console.log(req.body);
  if (
    !name ||
    !description ||
    !genre ||
    !cast ||
    !director ||
    !producer ||
    !releaseDate
  ) {
    return res.status(400).json({ message: "Missing required Fields." });
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
    await MovieModel.createMovie(movieData);
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

//fetch movie details by name
exports.getMovieDetails = async (req, res) => {
  const { movieName } = req.params;
  // console.log(movieName,'++++++++++')
  if (!movieName) {
    return res.status(400).json({ message: "Movie name is not provided." });
  }
  try {
    const data = await MovieModel.getMovieByName(movieName);
    // console.log('--======', data.Items);
    if (!data.Items || data.Items.length === 0) {
      return res.status(404).json({ message: "Movie Not Found" });
    } else {
      const response = data.Items[0];
      // return res.status(200).json({movie, message : "Movie found successfully."})
      return res.status(200).json({
          response,
        message: "Movie Found",
      });
    }
  } catch (err) {
    console.log("Error in fetching movie ", err);
    return res.status(500).json({ message: "Error fetching movie details" });
  }
};

//fetcch all movies by releaseDate
exports.getSortedMovies = async (req, res) => {
  // const movieId = req.params
  const ReleaseDate = req.query.releaseDate;

  // console.log(ReleaseDate,'---=====');
  if (!ReleaseDate) {
    try {
        const data = await MovieModel.getAllMovies();
        // let response;
        if (data && data.Items && data.Items.length > 0) {
          // console.log(data.Items);
          const response = data.Items;
          return res.status(200).json({ response, message: "Movie Found" });
        } else {
          return res.status(404).json({ message: "No Movie exist." });
        }
        // else return data;
      } catch (err) {
        console.log("Error fetching all movies", err);
        return res.status(500).json({ message: "Error Fetching Movies" });
      }
    // return res.status(400).json({ message: "Release date is required" });
  }

  try {
    const data = await MovieModel.getAllMoviesByDate(ReleaseDate);
    // let response;
    if (data && data.Items && data.Items.length > 0) {
      // console.log(data.Items);
      const response = data.Items;
      return res.status(200).json({ response, message: "Movie Found" });
    } else {
      return res.status(404).json({ message: "No Movie exist." });
    }
    // else return data;
  } catch (err) {
    console.log("Error fetching all movies", err);
    return res.status(500).json({ message: "Error Fetching Movies" });
  }
};

// filter movies by genre
exports.filterByGenre = async (req, res) => {
  const { genre } = req.query; //using {} this becasue getting genre as a object so destructuring it.

  if (!genre) {
    return res.status(400).json({ message: "Genre not provided." });
  }
  try {
    // console.log('455455')
    const data = await MovieModel.filterMoviesByGenre(genre);
    return res.status(200).json(data.Items);
  } catch (err) {
    console.log("Error in fetching movie by genre", err);
    return res
      .status(500)
      .json({ message: "Error in fetching movie by genre" });
  }
};
