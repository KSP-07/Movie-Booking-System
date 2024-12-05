const express = require("express");

const {
  createMovie,
  getSortedMovies,
  getMovieDetails,
  filterByGenre,
} = require("../controllers/movieController");

const router = express.Router();

router.post("/", createMovie);
router.get("/sortedList", getSortedMovies); //this i am defining first than movieName route because :movieName is dynamic and it will read sortedList as the prams
router.get("/filter", filterByGenre);
router.get("/:movieName", getMovieDetails);

module.exports = router;
