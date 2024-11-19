

const express = require('express');

const {createTheater , getTheaterShows , addShow} = require('../controllers/theaterController');

const router = express.Router();


router.post('/', createTheater);
router.post('/:theaterId/movie/":movieId/show', addShow);
router.get('/:theaterId/shows', getTheaterShows);



module.exports = router;