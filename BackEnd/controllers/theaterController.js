const TheaterModel = require("../model/theaterModel");
const { v4: uuidv4 } = require("uuid");

//create theater
exports.createTheater = async (req, res) => {
  const { name, location, screens } = req.body;

  if (!name || !location || !screens) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const theaterId = `THEATER#${uuidv4()}`;
  const theaterData = {
    PK: theaterId,
    SK: "MetaData",
    Entity: "THEATER",
    Name: name,
    Location: location,
    Screens: screens,
    Shows: [],
  };

  try {
    await TheaterModel.createTheater(theaterData);
    res.status(201).json({ theaterId, message: "Theater created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating theater" });
  }
};

//add the show to the theater
exports.addShow = async (req, res) => {
  let { theaterId, movieId } = req.params;
  theaterId = "THEATER#" + theaterId;
  movieId = "MOVIES#" + movieId;
  const { showTime, availableSeats, screen } = req.body;

  //validate input
  if (!theaterId || !movieId || !showTime || !availableSeats ) {
    res.status(400).json({ message: "Missing required fields" });
  }
  const showId = uuidv4(); //generate uniqure showID
  //add the show

  try {
    await TheaterModel.addShowToTheater(
      theaterId,
      movieId,
      showTime,
      availableSeats,
      screen,
      showId
    );

    // console.log(showId,'++++++++++++++');
    return res.status(201).json({showId, message: "Show added successfully",});
  } catch (err) {
    if (error.code === "ConditionalCheckFailedException") {
      return res.status(409).json({
        success: false,
        message: "ShowTime already exists.",
      });
    }
    console.log("Error adding show to the theater ", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//fetch shows in a theater
exports.getTheaterShows = async (req, res) => {
  // console.log(req.params,'----===++');
  let theaterId = req.params.theaterId;

  if(!theaterId) {
    res.status(400).json({message : "theater id missing."})
  }
  theaterId = "THEATER#" + theaterId;

  // console.log(theaterId, "+++++++++++------");
  try {
    const data = await TheaterModel.getTheaterShows(theaterId);
    res.status(200).json(data.Items);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching theater shows" });
  }
};

// //fetch show information in a theater
// exports.getShowInfo = async (req, res) => {
//     // console.log(req.params,'----===++');
//   const theaterId  = 'THEATER#' + req.params.theaterId;
//   const { showId, seats } = req.body;

//   console.log(theaterId,'+++++++++++------');
//   try {
//     const data = await TheaterModel.getTheaterShows(theaterId);
//     res.status(200).json(data.Items);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Error fetching theater shows" });
//   }
// };