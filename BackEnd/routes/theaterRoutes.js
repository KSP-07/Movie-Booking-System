const express = require("express");

const {
  createTheater,
  getTheaterShows,
  getShowDetails,
  addShow,
  getAllTheaters
} = require("../controllers/theaterController");
const authenticate = require("../middlewares/auth");

const router = express.Router();

router.post("/", authenticate("Admin"), createTheater);
router.get("/admin/:id", authenticate("Admin"), getAllTheaters);
router.post("/:theaterId/movies/:movieId/show", authenticate("Admin"), addShow);
router.get("/:theaterId/shows", getTheaterShows);
// router.get('/show/:theaterId', getShowDetails);

module.exports = router;
