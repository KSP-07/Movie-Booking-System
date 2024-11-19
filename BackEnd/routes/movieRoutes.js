
const express = require('express');

const {createMovie, getAllMovies , getMovieDetails, filterMoviesByGenre} = require('../controllers/movieController');

const router = express.Router();


router.post('/' , createMovie);
router.get('/:movieName',getMovieDetails);
router.get('/',getAllMovies);
router.get('/filter', filterMoviesByGenre);

module.exports = router;