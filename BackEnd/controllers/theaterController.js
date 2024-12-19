// const TheaterModel = require("../model/theaterModel");
// const { v4: uuidv4 } = require("uuid");

// //create theater
// exports.createTheater = async (req, res) => {
//   const { name, location, screens } = req.body;

//   if (!name || !location || !screens) {
//     return res.status(400).json({ message: "Missing required fields." });
//   }

//   const theaterId = `THEATER#${uuidv4()}`;
//   const theaterData = {
//     PK: theaterId,
//     SK: "MetaData",
//     Entity: "THEATER",
//     Name: name,
//     Location: location,
//     Screens: screens,
//     Shows: [],
//   };

//   try {
//     await TheaterModel.createTheater(theaterData);
//     return res
//       .status(201)
//       .json({ theaterId, message: "Theater created successfully" });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Error creating theater" });
//   }
// };

// // handle request for fetching all theaters
// exports.getAllTheaters = async (req, res) => {
//   try {
//     let {id} = req.params;

//     id = "THEATER#" + id;
//     // Call the model method to fetch theaters
//     const theaters = await TheaterModel.getTheaters(id);
    
//     if (!theaters || theaters.length === 0) {
//       return res.status(404).json({ message: "No theaters found." });
//     }

//     return res.status(200).json({
//       message: "Theaters fetched successfully",
//       theaters: theaters,
//     });
//   } catch (err) {
//     console.error("Error fetching theaters:", err);
//     return res.status(500).json({ message: "Error fetching theaters." });
//   }
// };

// //add the show to the theater
// exports.addShow = async (req, res) => {
//   let { theaterId, movieId } = req.params;
//   theaterId = "THEATER#" + theaterId;
//   movieId = "MOVIES#" + movieId;
//   const { showTime, availableSeats, screen } = req.body;

//   //validate input
//   if (!theaterId || !movieId || !showTime || !availableSeats) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }
//   const showId = uuidv4(); //generate uniqure showID
//   //add the show

//   try {
//     await TheaterModel.addShowToTheater(
//       theaterId,
//       movieId,
//       showTime,
//       availableSeats,
//       screen,
//       showId
//     );

//     // console.log(showId,'++++++++++++++');
//     return res.status(201).json({ showId, message: "Show added successfully" });
//   } catch (err) {
//     //
//     if (err.code === "TransactionCanceledException") {
//       const cancellationReasons = err.CancellationReasons || [];
//       // console.error("Transaction cancelled, reasons:", JSON.stringify(cancellationReasons, null, 2));

//       let response;
//       cancellationReasons.forEach((reason) => {
//         if (reason.Code === "ConditionalCheckFailed") {
//           response = "Movie or Theater not found";
//         }
//       });
//       if (response.length > 0) {
//         return res.status(404).json({ message: response });
//       }
//     }

//     console.log("Error adding show to the theater ", err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// //fetch shows in a theater
// exports.getTheaterShows = async (req, res) => {
//   // console.log(req.params,'----===++');
//   let theaterId = req.params.theaterId;

//   if (!theaterId) {
//     return res.status(400).json({ message: "theater id missing." });
//   }
//   theaterId = "THEATER#" + theaterId;

//   // console.log(theaterId, "+++++++++++------");
//   try {
//     const data = await TheaterModel.getTheaterShows(theaterId);
//     if (data.Items && data.Items.length > 0)
//       return res.status(200).json(data.Items);
//     else {
//       return res.status(404).json({ message: "No shows found" });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Error fetching theater shows" });
//   }
// };

// // //fetch show information in a theater
// // exports.getShowInfo = async (req, res) => {
// //     // console.log(req.params,'----===++');
// //   const theaterId  = 'THEATER#' + req.params.theaterId;
// //   const { showId, seats } = req.body;

// //   console.log(theaterId,'+++++++++++------');
// //   try {
// //     const data = await TheaterModel.getTheaterShows(theaterId);
// //     res.status(200).json(data.Items);
// //   } catch (err) {
// //     console.log(err);
// //     res.status(500).json({ message: "Error fetching theater shows" });
// //   }
// // };


const TheaterModel = require("../model/theaterModel");
const { v4: uuidv4 } = require("uuid");
const { redisCacheCall } = require("../utils/redisCalls"); // Adjust path as needed

const CACHE_EXPIRY = 3600; // Cache expiry time in seconds (1 hour)

// Create theater
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

    // Invalidate the cached theaters list
    await redisCacheCall("del", "ALL_THEATERS");

    return res
      .status(201)
      .json({ theaterId, message: "Theater created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error creating theater" });
  }
};

// Fetch all theaters
exports.getAllTheaters = async (req, res) => {
  try {
    const cacheKey = "ALL_THEATERS";

    // Check Redis cache first
    const cachedData = await redisCacheCall("get", cacheKey);
    if (cachedData) {
      return res.status(200).json({
        message: "Theaters fetched successfully (from cache)",
        theaters: cachedData,
      });
    }

    // Call the model method to fetch theaters
    const theaters = await TheaterModel.getTheaters();

    if (!theaters || theaters.length === 0) {
      return res.status(404).json({ message: "No theaters found." });
    }

    // Cache the theaters
    await redisCacheCall("set", cacheKey, CACHE_EXPIRY, theaters);

    return res.status(200).json({
      message: "Theaters fetched successfully",
      theaters: theaters,
    });
  } catch (err) {
    console.error("Error fetching theaters:", err);
    return res.status(500).json({ message: "Error fetching theaters." });
  }
};

// Add show to the theater
exports.addShow = async (req, res) => {
  let { theaterId, movieId } = req.params;
  theaterId = "THEATER#" + theaterId;
  movieId = "MOVIES#" + movieId;
  const { showTime, availableSeats, screen } = req.body;

  if (!theaterId || !movieId || !showTime || !availableSeats) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const showId = uuidv4(); // Generate unique showID

  try {
    await TheaterModel.addShowToTheater(
      theaterId,
      movieId,
      showTime,
      availableSeats,
      screen,
      showId
    );

    // Invalidate cached shows for the theater
    const cacheKey = `THEATER:SHOWS:${theaterId}`;
    await redisCacheCall("del", cacheKey);

    return res.status(201).json({ showId, message: "Show added successfully" });
  } catch (err) {
    if (err.code === "TransactionCanceledException") {
      const cancellationReasons = err.CancellationReasons || [];

      let response = "";
      cancellationReasons.forEach((reason) => {
        if (reason.Code === "ConditionalCheckFailed") {
          response = "Movie or Theater not found";
        }
      });
      if (response.length > 0) {
        return res.status(404).json({ message: response });
      }
    }

    console.log("Error adding show to the theater ", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fetch shows in a theater
exports.getTheaterShows = async (req, res) => {
  let theaterId = req.params.theaterId;

  if (!theaterId) {
    return res.status(400).json({ message: "Theater ID missing." });
  }
  theaterId = "THEATER#" + theaterId;

  try {
    const cacheKey = `THEATER:SHOWS:${theaterId}`;

    // Check Redis cache first
    const cachedData = await redisCacheCall("get", cacheKey);
    if (cachedData) {
      return res.status(200).json({
        message: "Shows fetched successfully (from cache)",
        shows: cachedData,
      });
    }

    // Fetch from database if not in cache
    const data = await TheaterModel.getTheaterShows(theaterId);

    if (data.Items && data.Items.length > 0) {
      // Cache the shows
      await redisCacheCall("set", cacheKey, CACHE_EXPIRY, data.Items);

      return res.status(200).json({
        message: "Shows fetched successfully",
        shows: data.Items,
      });
    } else {
      return res.status(404).json({ message: "No shows found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching theater shows" });
  }
};

// Fetch show information in a theater
exports.getShowInfo = async (req, res) => {
  const theaterId = "THEATER#" + req.params.theaterId;
  const { showId } = req.body;

  if (!showId) {
    return res.status(400).json({ message: "Show ID missing." });
  }

  try {
    const cacheKey = `SHOW:${theaterId}#${showId}`;

    // Check Redis cache first
    const cachedData = await redisCacheCall("get", cacheKey);
    if (cachedData) {
      return res.status(200).json({
        message: "Show information fetched successfully (from cache)",
        showInfo: cachedData,
      });
    }

    // Fetch from database if not in cache
    const data = await TheaterModel.getShowInfo(theaterId, showId);

    if (!data) {
      return res.status(404).json({ message: "Show not found." });
    }

    // Cache the show information
    await redisCacheCall("set", cacheKey, CACHE_EXPIRY, data);

    return res.status(200).json({
      message: "Show information fetched successfully",
      showInfo: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching show information" });
  }
};
