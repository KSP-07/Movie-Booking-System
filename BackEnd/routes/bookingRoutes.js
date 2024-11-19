

const express = require('express');
const router = express.Router();
const {createBooking, getBooking, getBookings, getBookingsByStatus,cancelBooking} = require('../controllers/bookingController');


//create a new booking
router.post('/' , createBooking);

//fetch details of a specific booking
router.get('/:userId/:bookingId' , getBooking);

//fetch all bookings of a user with pagination
router.get('/:userId' , getBookings);

//fetch bookings by status
router.get('/:userId/status', getBookingsByStatus);


//cancel a booking
router.delete('/;userId/:bookingId' , cancelBooking);

module.exports = router;