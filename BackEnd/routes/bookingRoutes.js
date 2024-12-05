const express = require("express");
const router = express.Router();
const {
  createBooking,
  confirmBooking,
  getBooking,
  getBookings,
  getBookingsByStatus,
  cancelBooking,
} = require("../controllers/bookingController");
const { getTheaterShows } = require("../controllers/theaterController");
const authenticate = require("../middlewares/auth");

//create a new booking
router.post("/theater/:theaterId", authenticate(), createBooking);

// //get shows of the theater
// router.post('/show/:theaterId'  , getTheaterShows);

//to confirm the booking
router.post("/confirm", authenticate(), confirmBooking);

//cancel a booking
router.delete("/delete/:userId/:bookingId", authenticate(), cancelBooking);

//fetch bookings by status
router.get("/status/:userId/:status", authenticate(), getBookingsByStatus);

//fetch details of a specific booking
router.get("/:userId/:bookingId", authenticate(), getBooking);

//fetch all bookings of a user with pagination
router.get("/:userId", authenticate(), getBookings);

module.exports = router;
