
const  BookingModel = require('../model/bookingModel');


//create booking
exports.createBooking = async(req ,res)=>{
    const {userId, showId , seats , totalAmt } = req.body;

    const bookingId = `Booking#${Date.now()}`;

    const bookingData = {
        PK : `USER#${userId}`,
        SK : bookingId,
        Entity : 'BOOKING',
        BookingId : bookingId,
        ShowId : showId,
        Seats : seats,
        TotalAmount : totalAmt,
        Status : 'confirmed',
    };

    try{
        await BookingModel.createBooking(bookingData);
        res.status(201).json({message : 'Boooking confirmed'});
    }
    catch(err){
        console.log("Error in creating booking ", err);
        res.status(500).json({message : 'Error creating a booking'});
    }
};

//fetch booking details
exports.getBooking = async(req, res) =>{
    const {userId , bookingId} = req.params;
    try{
        const booking = await BookingModel.getBooking(userId, bookingId);

        if(!booking){
            return res.status(404).json({message : "Booking Not Found"});
        }

        res.status(200).json(booking);
    }catch(err){
    console.error(error);
    res.status(500).json({ message: 'Error fetching booking details' });
    }
};

//fetch all bookings of a user with pagination
exports.getBookings = async(req, res)=>{
    const {userId} = req.params;
    const {limit = 5 , lastKey} = req.query;

    try{
        const result = await BookingModel.getBookings(userId , parent(limit, 10) , lastKey?JSON.parse(decodeURIComponent(lastKey)):undefined);
        res.status(200).json(result);
    }
    catch(err){
        console.error(error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
}


//fetch bookings by status
exports.getBookingsByStatus = async(req, res)=>{
    const {userId} = req.params;
    const {status} = req.query;

    try{
        const bookings = await BookingModel.getBookingsByStatus(userId, status);

        if(!bookings.length){
            return res.status(404).json({message :'No bookings found for the given status'});
        }

        res.status(200).json(bookings);
    }
    catch(err){
        console.error(error);
        res.status(500).json({ message: 'Error fetching bookings by status' });
    }
};

//cancel a booking
exports.cancelBooking = async(req, res)=>{
    const {userId, bookingId} = req.params;

    try{
        await BookingModel.cancelBooking(userId, bookingId);
    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
};
