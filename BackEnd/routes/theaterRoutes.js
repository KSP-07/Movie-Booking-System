

const express = require('express');

const {createTheater , getTheaterShows ,getShowDetails, addShow} = require('../controllers/theaterController');
const authenticate = require('../middlewares/auth');

const router = express.Router();


router.post('/',authenticate('Admin'),createTheater);
router.post('/:theaterId/movies/:movieId/show',authenticate('Admin'), addShow);
router.get('/:theaterId/shows', getTheaterShows);
// router.get('/show/:theaterId', getShowDetails);



module.exports = router;