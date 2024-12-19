const BookingModel = require("../model/bookingModel");
// const  {getTheaterShows} = require('../controllers/theaterController');
const { v4: uuidv4 } = require("uuid");
const UserModel = require("../model/userModel");
const { redisCacheCall } = require("../utils/redisCalls");


// Cache expiry time in seconds (e.g., 1 hour)
const CACHE_EXPIRY = 3600;

// // Create booking
// exports.createBooking = async (req, res) => {
//   const TICKET_PRICE = 200; // ticket price

//   if (!req.params.theaterId) {
//     return res.status(400).json({ message: "Theater Id is missing." });
//   }
//   const theaterId = "THEATER#" + req.params.theaterId;
//   const { movieName ,movieId, showId, seats, showTime } = req.body;

//   if (!movieName || !movieId || !showId || !seats || seats <= 0) {
//     return res
//       .status(400)
//       .json({ message: "Invalid movieId or showId or seats information." });
//   }

//   const userId = req.user.id; // Extract user ID from the JWT token

//   const sk = movieId + "ShowId#" + showId;
//   let epochShowTime = Math.floor(new Date(showTime).getTime() / 1000);

//   try {
//     // Fetching the show details to check if seat are available
//     // const result = await TheaterModel.getTheaterShows(theaterId);
//     const result = await BookingModel.getShowDetails(theaterId, sk);
//     console.log(result,'0000000000000000000');   //for checking the available seats.
//     let showDetails;
//     if (result.Item) {
//       showDetails = result.Item;

//       if (!showDetails) {
//         return res.status(404).json({ message: "Show not found." });
//       }
//     }

//     const availableSeats = showDetails.AvailableSeats; //storing the available seats of the show
//     // console.log(availableSeats,'')

//     // console.log(availableSeats , '+++++99');

//     // console.log(availableSeats,'-----');

//     if (Number(availableSeats) < Number(seats)) {
//       console.log(typeof availableSeats , typeof seats , 'types popf ');
//       return res
//         .status(400)
//         .json({ message: "Not enough seats available.", availableSeats });
//     }

//     const totalAmt = seats * TICKET_PRICE;

//     return res.status(200).json({
//       message: "Proceed to payment confirmation",
//       data: {
//         totalAmt,
//         epochShowTime,
//         seats,
//         availableSeats,
//         showId,
//         userId,
//         movieId,
//         movieName, 
//         theaterId
//       },
//     });
//   } catch (err) {
//     console.error("Error checking seat availability:", err);
//     return res
//       .status(500)
//       .json({ message: "Internal server error(seat availability)." });
//   }
// };

// // Confirm booking after payment
// exports.confirmBooking = async (req, res) => {
//   const {
//     movieName,
//     theaterId,
//     movieId,
//     showTime,
//     showId,
//     availableSeats,
//     seats,
//     totalAmt,
//   } = req.body;
// // console.log(typeof availableSeats)
//   if (!movieName || !theaterId || !movieId || !showId || !seats || seats <= 0 || !totalAmt) {
//     return res.status(400).json({ message: "Missing required fields." });
//   }

//   const userId = req.user.id; // Extract user ID from the JWT token
//   console.log(userId);

//   console.log(theaterId, "     ", movieId);

//   //   const userId = req.user.id;  //for u
//   const bookingId = `BOOKING#${uuidv4()}`;

//   // const

//   // const epochShowTime = Math.floor(new Date(showTime) / 1000);
//   const epochShowTime = Math.floor(new Date(showTime).getTime() / 1000);

//   // console.log(typeof epochShowTime);
//   // const bookigDate = Math.floor(Date.now()/1000);
//   const bookingData = {
//     PK: userId,
//     SK: bookingId,
//     Entity: "BOOKING",
//     MovieName : movieName,
//     BookingId: bookingId,
//     ShowId: showId,
//     Seats: Number(seats),
//     TheaterId: theaterId,
//     MovieId: movieId,
//     TotalAmount: totalAmt,
//     Status: "confirmed",
//     BookingDate: epochShowTime.toString(),
//   };

//   console.log("Booking Date cr , ", epochShowTime.toString());
//   try {
//     const sk = movieId + "ShowId#" + showId;
//     // console.log('2222222');
//     // Deduct the seats from the show

//     // const result = await BookingModel.getShowDetails(theaterId, sk);
//     // console.log(result,'00000000001111111');

//     console.log('    ',sk,'0909090909090');
//     const result = await BookingModel.getShowDetails(theaterId, sk);
//     console.log(result,'0000000000000000000');   //for checking the available seats.
//     let showDetails;
//     if (result.Item) {
//       showDetails = result.Item;
//       console.log("ShowDeatails", showDetails);

//       if (!showDetails) {
//         return res.status(404).json({ message: "Show not found." });
//       }
//     } else {
//       return res.status(404).json({ message: "Show not found." });
//     }
//     //adding booking id in user's booking array
//     const updateExpression = [];
//     const expressionAttributeValues = {};
//     const expressionAttributeNames = {};

//     updateExpression.push(
//       "SET #bookings = list_append(if_not_exists(#bookings, :emptyList), :bookingId)"
//     );

//     // Set the expression attribute names
//     expressionAttributeNames["#bookings"] = "Bookings"; // Assuming 'Bookings' is the attribute name in your DynamoDB schema

//     // Set the expression attribute values
//     expressionAttributeValues[":bookingId"] = [bookingId]; // Booking ID is added as an array
//     expressionAttributeValues[":emptyList"] = []; // Default empty array in case 'Bookings' attribute doesn't exist

//     // Create the booking
//     await BookingModel.createBooking(bookingData);
//     //updating the bookings in user data
//     await BookingModel.updateShowSeats(theaterId, sk, Number(availableSeats) - Number(seats)); //updating the seats by deducting it.
//     await UserModel.updateUser(
//       userId,
//       updateExpression.join(", "),
//       expressionAttributeValues,
//       expressionAttributeNames
//     );

//     return res
//       .status(201)
//       .json({
//         message: "Booking confirmed",
//         bookingData
//       });
//   } catch (err) {
//     console.error("Error in confirming booking:", err);
//     return res.status(500).json({ message: "Error confirming booking." });
//   }
// };


// Create booking
exports.createBooking = async (req, res) => {
  const TICKET_PRICE = 200; // Ticket price

  if (!req.params.theaterId) {
    return res.status(400).json({ message: "Theater ID is missing." });
  }

  const theaterId = "THEATER#" + req.params.theaterId;
  const { movieName, movieId, showId, seats, showTime } = req.body;

  if (!movieName || !movieId || !showId || !seats || seats <= 0) {
    return res
      .status(400)
      .json({ message: "Invalid movieId, showId, or seats information." });
  }

  const userId = req.user.id; // Extract user ID from the JWT token
  const sk = movieId + "ShowId#" + showId;
  const epochShowTime = Math.floor(new Date(showTime).getTime() / 1000);

  try {
    // Check for cached show details
    const cacheKey = `showDetails:${theaterId}:${sk}`;
    let showDetails = await redisCacheCall("get", cacheKey);

    if (!showDetails) {
      const result = await BookingModel.getShowDetails(theaterId, sk);

      if (!result.Item) {
        return res.status(404).json({ message: "Show not found." });
      }

      showDetails = result.Item;
     
      await redisCacheCall("set", cacheKey, CACHE_EXPIRY, showDetails);
    }

    const availableSeats = showDetails.AvailableSeats;

    if (Number(availableSeats) < Number(seats)) {
      return res.status(400).json({
        message: "Not enough seats available.",
        availableSeats,
      });
    }

    const totalAmt = seats * TICKET_PRICE;

    return res.status(200).json({
      message: "Proceed to payment confirmation",
      data: {
        totalAmt,
        epochShowTime,
        seats,
        availableSeats,
        showId,
        userId,
        movieId,
        movieName,
        theaterId,
      },
    });
  } catch (err) {
    console.error("Error checking seat availability:", err);
    return res.status(500).json({
      message: "Internal server error (seat availability).",
    });
  }
};

// Confirm booking after payment
exports.confirmBooking = async (req, res) => {
  const {
    movieName,
    theaterId,
    movieId,
    showTime,
    showId,
    availableSeats,
    seats,
    totalAmt,
  } = req.body;

  if (!movieName || !theaterId || !movieId || !showId || !seats || seats <= 0 || !totalAmt) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const userId = req.user.id; // Extract user ID from the JWT token
  const bookingId = `BOOKING#${uuidv4()}`;
  const epochShowTime = Math.floor(new Date(showTime).getTime() / 1000);

  const bookingData = {
    PK: userId,
    SK: bookingId,
    Entity: "BOOKING",
    MovieName: movieName,
    BookingId: bookingId,
    ShowId: showId,
    Seats: Number(seats),
    TheaterId: theaterId,
    MovieId: movieId,
    TotalAmount: totalAmt,
    Status: "confirmed",
    BookingDate: epochShowTime.toString(),
  };

  try {
    const sk = movieId + "ShowId#" + showId;
    const cacheKey = `showDetails:${theaterId}:${sk}`;
    let showDetails = await redisCacheCall("get", cacheKey);

    if (!showDetails) {
      const result = await BookingModel.getShowDetails(theaterId, sk);

      if (!result.Item) {
        return res.status(404).json({ message: "Show not found." });
      }

      showDetails = result.Item;
    }

    const newAvailableSeats = Number(availableSeats) - Number(seats);

    // Create the booking
    await BookingModel.createBooking(bookingData);

    // Update the show's available seats
    await BookingModel.updateShowSeats(theaterId, sk, newAvailableSeats);

    // Invalidate the cache for the show details
    await redisCacheCall("del", cacheKey);

    // Update user's bookings list
    const updateExpression = "SET #bookings = list_append(if_not_exists(#bookings, :emptyList), :bookingId)";
    const expressionAttributeValues = {
      ":bookingId": [bookingId],
      ":emptyList": [],
    };
    const expressionAttributeNames = {
      "#bookings": "Bookings",
    };

    await UserModel.updateUser(
      userId,
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames
    );

    return res.status(201).json({
      message: "Booking confirmed",
      bookingData,
    });
  } catch (err) {
    console.error("Error confirming booking:", err);
    return res.status(500).json({ message: "Error confirming booking." });
  }
};


// //fetch booking details
// exports.getBooking = async (req, res) => {
//   let { bookingId } = req.params;
//   let { userId } = req.params;

//   if (!bookingId || !userId) {
//     return res
//       .status(400)
//       .json({ message: "Missing Required Fields(bookingid or userId" });
//   }
//   userId = "USER#" + userId;
//   bookingId = "BOOKING#" + bookingId;

//   const jwtUserId = req.user.id;
//   // console.log(bookingId,'++++');

//   if (userId !== jwtUserId) {
//     return res.status(409).json({ message: "Different UserId is used." });
//   }
//   try {
//     const booking = await BookingModel.getBooking(userId, bookingId);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking Not Found" });
//     }
//     return res.status(200).json(booking);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching booking details" });
//   }
// };

// //fetch all bookings of a user with pagination
// exports.getBookings = async (req, res) => {
//   let { userId } = req.params;

//   if (!userId) {
//     return res.status(400).json({ message: "user id is missing." });
//   }
//   userId = "USER#" + userId;
//   const { limit = 50, lastKey } = req.query;

//   try {
//     const result = await BookingModel.getBookings(
//       userId,
//       limit,
//       lastKey ? JSON.parse(decodeURIComponent(lastKey)) : undefined
//     );
//     if (result.Items.length === 0)
//       return res.status(404).json({ message: "No Bookings found" });
//     return res.status(200).json(result.Items);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching bookings" });
//   }
// };

// //fetch bookings by status
// exports.getBookingsByStatus = async (req, res) => {
//   let { userId, status } = req.params;
//   // const {status} = req.query;
//   // console.log(status, "+++++");
//   if (!userId || !status) {
//     return res.status(400).json({ message: "Missing userId or Status" });
//   }
//   console.log(status, "sta");
//   if (status == "cancelled" || status === "confirmed") {
//     console.log("Status verified");
//   } else return res.status(400).json({ message: "Invalid status." });
//   userId = "USER#" + userId;
//   const JwtUserId = req.user.id;

//   if (userId !== JwtUserId) {
//     return res.status(409).json({ message: "Different UserId is used." });
//   }

//   try {
//     const bookings = await BookingModel.getBookingsByStatus(userId, status);

//     if (!bookings.length) {
//       return res
//         .status(404)
//         .json({ message: "No bookings found for the given status" });
//     }

//     return res.status(200).json(bookings);
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(500)
//       .json({ message: "Error fetching bookings by status" });
//   }
// };


// Fetch booking details
exports.getBooking = async (req, res) => {
  let { bookingId, userId } = req.params;

  if (!bookingId || !userId) {
    return res
      .status(400)
      .json({ message: "Missing Required Fields (bookingId or userId)" });
  }

  userId = "USER#" + userId;
  bookingId = "BOOKING#" + bookingId;

  const jwtUserId = req.user.id;

  if (userId !== jwtUserId) {
    return res.status(409).json({ message: "Different UserId is used." });
  }

  const cacheKey = `booking:${userId}:${bookingId}`;

  try {
    // Try fetching from cache
    let booking = await redisCacheCall("get", cacheKey);

    if (!booking) {
      // Fetch from database if not in cache
      booking = await BookingModel.getBooking(userId, bookingId);

      if (!booking) {
        return res.status(404).json({ message: "Booking Not Found" });
      }

      // Cache the booking details for 5 minutes
      await redisCacheCall("set", cacheKey, 300, booking);
    }

    return res.status(200).json(booking);
  } catch (err) {
    console.error("Error fetching booking details:", err);
    return res.status(500).json({ message: "Error fetching booking details" });
  }
};

// Fetch all bookings of a user with pagination
exports.getBookings = async (req, res) => {
  let { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is missing." });
  }

  userId = "USER#" + userId;
  const { limit = 50, lastKey } = req.query;
  const cacheKey = `bookings:${userId}:limit=${limit}:lastKey=${lastKey || "none"}`;

  try {
    // Try fetching from cache
    let result = await redisCacheCall("get", cacheKey);

    if (!result) {
      // Fetch from database if not in cache
      result = await BookingModel.getBookings(
        userId,
        limit,
        lastKey ? JSON.parse(decodeURIComponent(lastKey)) : undefined
      );

      if (result.Items.length === 0) {
        return res.status(404).json({ message: "No Bookings found" });
      }

      // Cache the result for 5 minutes
      await redisCacheCall("set", cacheKey, 300, result);
    }

    return res.status(200).json(result.Items);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return res.status(500).json({ message: "Error fetching bookings" });
  }
};

// Fetch bookings by status
exports.getBookingsByStatus = async (req, res) => {
  let { userId, status } = req.params;

  if (!userId || !status) {
    return res.status(400).json({ message: "Missing userId or status." });
  }

  if (!["cancelled", "confirmed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  userId = "USER#" + userId;
  const jwtUserId = req.user.id;

  if (userId !== jwtUserId) {
    return res.status(409).json({ message: "Different UserId is used." });
  }

  const cacheKey = `bookingsByStatus:${userId}:${status}`;

  try {
    // Try fetching from cache
    let bookings = await redisCacheCall("get", cacheKey);

    if (!bookings) {
      // Fetch from database if not in cache
      bookings = await BookingModel.getBookingsByStatus(userId, status);

      if (!bookings.length) {
        return res
          .status(404)
          .json({ message: "No bookings found for the given status" });
      }

      // Cache the bookings by status for 5 minutes
      await redisCacheCall("set", cacheKey, 300, bookings);
    }

    return res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings by status:", err);
    return res
      .status(500)
      .json({ message: "Error fetching bookings by status" });
  }
};


// //cancel a booking
// exports.cancelBooking = async (req, res) => {
//   let { bookingId } = req.params;
//   let { userId } = req.params;

//   if (!bookingId || !userId) {
//     return res.status(400).json({ message: "BookingId or userId is missing." });
//   }
//   userId = "USER#" + userId;
//   bookingId = "BOOKING#" + bookingId;
//   const jwtUserId = req.user.id;
//   console.log(bookingId,'++++');

//   if (userId !== jwtUserId) {
//     return res.status(409).json({ message: "Different UserId is used." });
//   }

//   //update(increase) the show seats
//   try {
//     const bookingData = await BookingModel.getBooking(userId, bookingId);
//     if (!bookingData) {
//       return res.status(404).json({ message: "Booking does not exist" });
//     }
//     const theaterId = bookingData.TheaterId;
//     const movieId = bookingData.MovieId;
//     const showId = bookingData.ShowId;
//     const seats = bookingData.Seats;
//     const showTime = bookingData.BookingDate;
//     const currentTime = Math.floor(Date.now() / 1000).toString();

//     // console.log(showTime , '0-----' , currentTime);
//     console.log(bookingData,'bod;fdfd')
//     if (Number(showTime) <= Number(currentTime)) {
//       return res
//         .status(409)
//         .json({ message: "Can not cancel after the show has ended" });
//     }

//     console.log(bookingData , 'lafladlfadslfad')
//     const sk = movieId + "ShowId#" + showId;

//     const result = await BookingModel.getShowDetails(theaterId, sk);
//     let showDetails;
//     if (result.Item) {
//       showDetails = result.Item;

//       if (!showDetails) {
//         return res.status(404).json({ message: "Show not found." });
//       }
//     }

//     let availableSeats;
//     if (showDetails.AvailableSeats) availableSeats = showDetails.AvailableSeats;
//     // console.log(availableSeats , '+++++992');
//     await BookingModel.updateShowSeats(theaterId, sk, Number(availableSeats + seats));

//     //for testing purpose to check if seats are getting addded.
//     // const result2 = await BookingModel.getShowDetails(theaterId ,sk );
//     // console.log(result2,'00000000000111111');

//     // res.status(204).json({message : "Boo"})
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Error in updating show seats" });
//   }

//   try {
//     await BookingModel.cancelBooking(userId, bookingId);
//     return res.status(200).json({ message: "Booking cancelled successfully" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Error cancelling booking" });
//   }
// };


// Cancel a booking
exports.cancelBooking = async (req, res) => {
  let { bookingId, userId } = req.params;

  if (!bookingId || !userId) {
    return res.status(400).json({ message: "BookingId or userId is missing." });
  }

  userId = "USER#" + userId;
  bookingId = "BOOKING#" + bookingId;

  const jwtUserId = req.user.id;

  if (userId !== jwtUserId) {
    return res.status(409).json({ message: "Different UserId is used." });
  }

  // Try fetching the booking data
  try {
    const bookingData = await BookingModel.getBooking(userId, bookingId);
    if (!bookingData) {
      return res.status(404).json({ message: "Booking does not exist" });
    }

    const theaterId = bookingData.TheaterId;
    const movieId = bookingData.MovieId;
    const showId = bookingData.ShowId;
    const seats = bookingData.Seats;
    const showTime = bookingData.BookingDate;
    const currentTime = Math.floor(Date.now() / 1000).toString();

    if (Number(showTime) <= Number(currentTime)) {
      return res
        .status(409)
        .json({ message: "Can not cancel after the show has ended" });
    }

    // Update the available seats in the show
    const sk = movieId + "ShowId#" + showId;
    const result = await BookingModel.getShowDetails(theaterId, sk);

    let showDetails;
    if (result.Item) {
      showDetails = result.Item;
    }

    if (!showDetails) {
      return res.status(404).json({ message: "Show not found." });
    }

    const availableSeats = Number(showDetails.AvailableSeats);
    await BookingModel.updateShowSeats(theaterId, sk, availableSeats + seats);

    // Cache invalidation: Clear the booking from cache
    const cacheKey = `booking:${userId}:${bookingId}`;
    await redisCacheCall("del", cacheKey);

    // Clear the user's list of bookings from cache
    const userBookingsCacheKey = `bookings:${userId}:*`; // Invalidate all user bookings
    await redisCacheCall("del", userBookingsCacheKey);

  } catch (err) {
    console.error("Error in updating show seats or clearing cache:", err);
    return res.status(500).json({ message: "Error in updating show seats" });
  }

  try {
    // Cancel the booking in the database
    await BookingModel.cancelBooking(userId, bookingId);
    return res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({ message: "Error cancelling booking" });
  }
};
