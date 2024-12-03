const BookingModel = require("../model/bookingModel");
// const  {getTheaterShows} = require('../controllers/theaterController');
const { v4: uuidv4 } = require("uuid");
const UserModel = require("../model/userModel");


// Create booking
exports.createBooking = async (req, res) => {
  const TICKET_PRICE = 200; // ticket price

  if(!req.params.theaterId){
    res.status(400).json({message : "Theater Id is missing."})
  }
  const theaterId = "THEATER#" + req.params.theaterId;
  const { movieId, showId, seats, showTime } = req.body;

  if (!movieId || !showId || !seats || seats <= 0) {
    return res.status(400).json({ message: "Invalid movieId or showId or seats information." });
  }

  const userId = req.user.id; // Extract user ID from the JWT token

  const sk = movieId + "ShowId#" + showId;
  let epochShowTime = Math.floor(new Date(showTime).getTime() / 1000);

  try {
    // Fetching the show details to check if seat are available
    // const result = await TheaterModel.getTheaterShows(theaterId);
    const result = await BookingModel.getShowDetails(theaterId, sk);
    // console.log(result,'0000000000000000000');   //for checking the available seats.
    let showDetails;
    if (result.Item) {
      showDetails = result.Item;

      if (!showDetails) {
        return res.status(404).json({ message: "Show not found." });
      }
    }

    const availableSeats = showDetails.AvailableSeats; //storing the available seats of the show
    // console.log(availableSeats,'')

    // console.log(availableSeats , '+++++99');

    // console.log(availableSeats,'-----');

    if (availableSeats < seats) {
      return res.status(400).json({message: "Not enough seats available.",availableSeats,});
    }

    const totalAmt = seats * TICKET_PRICE;

    res.status(200).json({message: "Proceed to payment confirmation",
      totalAmt,
      epochShowTime,
      details: {
        seats,
        availableSeats,
        showId,
        userId,
      },
    });
  } catch (err) {
    console.error("Error checking seat availability:", err);
    res.status(500).json({ message: "Internal server error(seat availability)." });
  }
};

// Confirm booking after payment
exports.confirmBooking = async (req, res) => {
  const {theaterId,movieId,showTime,showId,availableSeats,seats,totalAmt} = req.body;

  if (!theaterId || !movieId || !showId || !seats || seats <= 0 || !totalAmt) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const userId = req.user.id; // Extract user ID from the JWT token 
  console.log(userId);

  console.log(theaterId, "     ", movieId);

//   const userId = req.user.id;  //for u
  const bookingId = `BOOKING#${uuidv4()}`;
  // const epochShowTime = Math.floor(new Date(showTime) / 1000);
  const epochShowTime = Math.floor(new Date(showTime).getTime() / 1000);

  // console.log(typeof epochShowTime);
  // const bookigDate = Math.floor(Date.now()/1000);
  const bookingData = {
    PK: userId,
    SK: bookingId,
    Entity: "BOOKING",
    BookingId: bookingId,
    ShowId: showId,
    Seats: seats,
    TheaterId : theaterId,
    MovieId : movieId,
    TotalAmount: totalAmt,
    Status: "confirmed",
    BookingDate: epochShowTime.toString(),
  };

  try {
    const sk = movieId + "ShowId" + showId;
    // console.log('2222222');
    // Deduct the seats from the show
    await BookingModel.updateShowSeats(theaterId, sk, availableSeats - seats); //updating the seats by deducting it.

    // const result = await BookingModel.getShowDetails(theaterId, sk);
    // console.log(result,'00000000001111111');

    // console.log('90909090');

    //adding booking id in user's booking array
    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};


    updateExpression.push(
      "SET #bookings = list_append(if_not_exists(#bookings, :emptyList), :bookingId)"
    );

    // Set the expression attribute names
    expressionAttributeNames["#bookings"] = "Bookings"; // Assuming 'Bookings' is the attribute name in your DynamoDB schema

    // Set the expression attribute values
    expressionAttributeValues[":bookingId"] = [bookingId]; // Booking ID is added as an array
    expressionAttributeValues[":emptyList"] = []; // Default empty array in case 'Bookings' attribute doesn't exist

    await UserModel.updateUser(userId,updateExpression.join(", "),expressionAttributeValues,expressionAttributeNames);


    // Create the booking
    await BookingModel.createBooking(bookingData);

    res.status(201).json({message: "Booking confirmed",bookingId,totalAmt,seats,});
  } catch (err) {
    console.error("Error in confirming booking:", err);
    res.status(500).json({ message: "Error confirming booking." });
  }
};

//fetch booking details
exports.getBooking = async (req, res) => {
  let { bookingId } = req.params;
  let { userId } = req.params;

  if(!bookingId || !userId){
    res.status(400).json({message : "Missing Required Fields(bookingid or userId"});
  }
  userId = "USER#" + userId;
  bookingId = "BOOKING#" + bookingId;


  const jwtUserId = req.user.id;
  // console.log(bookingId,'++++');

  if (userId !== jwtUserId) {
    return res.status(409).json({ message: "Different UserId is used." });
  }
  try {
    const booking = await BookingModel.getBooking(userId, bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking Not Found" });
    }
    res.status(200).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching booking details" });
  }
};

//fetch all bookings of a user with pagination
exports.getBookings = async (req, res) => {
  let { userId } = req.params;

  if(!userId){
    res.status(400).json({message : "user id is missing."});
  }
  userId = "USER#" + userId;
  const { limit = 5, lastKey } = req.query;

  try {
    const result = await BookingModel.getBookings(userId,limit,lastKey ? JSON.parse(decodeURIComponent(lastKey)) : undefined);
    res.status(200).json(result.Items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

//fetch bookings by status
exports.getBookingsByStatus = async (req, res) => {
  let { userId, status } = req.params;
  // const {status} = req.query;
  // console.log(status, "+++++");
  if(!userId || !status){
    res.status(400).json({message : "Missing userId or Status"});
  }
  userId = "USER#" + userId;
  const JwtUserId = req.user.id;

  if (userId !== JwtUserId) {
    return res.status(409).json({ message: "Different UserId is used." });
  }

  try {
    const bookings = await BookingModel.getBookingsByStatus(userId, status);

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found for the given status" });
    }

    res.status(200).json(bookings);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching bookings by status" });
  }
};

//cancel a booking
exports.cancelBooking = async (req, res) => {
  let { bookingId } = req.params;
  let { userId } = req.params;

  if(!bookingId || !userId){
    res.status(400).json({message : "BookingId or userId is missing."});
  }
  userId = "USER#" + userId;
  bookingId = "BOOKING#" + bookingId;
  const jwtUserId = req.user.id;
  // console.log(bookingId,'++++');

  if (userId !== jwtUserId) {
    return res.status(409).json({ message: "Different UserId is used." });
  }

  //update(increase) the show seats
  try{
    const bookingData = await BookingModel.getBooking(userId , bookingId);
    const theaterId = bookingData.TheaterId;
    const movieId = bookingData.MovieId;
    const showId = bookingData.ShowId;
    const seats = bookingData.Seats;

    const sk = movieId + "ShowId" + showId;

    const result = await BookingModel.getShowDetails(theaterId ,sk );
    // console.log(result,'0000000000000000000');
    let showDetails;
    if (result.Item) {
      showDetails = result.Item;

      if (!showDetails) {
        return res.status(404).json({ message: "Show not found." });
      }
    }

    const availableSeats = showDetails.AvailableSeats;
    // console.log(availableSeats , '+++++992');
    await BookingModel.updateShowSeats(theaterId , sk, availableSeats + seats );
    
    //for testing purpose to check if seats are getting addded.
    // const result2 = await BookingModel.getShowDetails(theaterId ,sk );
    // console.log(result2,'00000000000111111');

    // res.status(204).json({message : "Boo"})
  }
  catch(err){
    console.log(err);
    res.status(500).json({message : "Error in updating show seats"});
  }


  try {
    await BookingModel.cancelBooking(userId, bookingId);
    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error cancelling booking" });
  }

};
