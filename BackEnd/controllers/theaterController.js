
const TheaterModel = require('../model/theaterModel');

//create theater
exports.createTheater = async(req, res)=>{
    const {name, location , screens} = req.body;

    if(!name || !location || !screens){
        return res.status(400).json({message : 'Missing required fields.'});
    }

    const theaterId = `THEATER#${Date.now()}`;
    const theaterData = {
        PK : theaterId,
        SK : 'MetaData',
        Entity : 'Theater',
        theaterId,
        Name : name,
        Location : location,
        Screens : screens,
        Shows : [],
    };


    try{
        await TheaterModel.createTheater(theaterData);
        res.status(201).json({theaterId, message : 'Theater created successfully'});
    }
    catch(err){
        console.log(err);
        res.status(500).json({message : "Error creating theater"});
    }

};


//add the show to the theater
exports.addShow = async(res , res)=>{
    try{
        const {theaterId , movieId} = req.params;
        const {showTime, availableSeats, screen} = req.body;

        //validate input
        if(!theaterId || !movieId || !showTime || !availableSeats || !screen){
            res.status(400).json({message : "Missing required fields"});
        }

        //add the show
        const {showId} = await theaterModel.addShowToTheater(
            theaterId,
            movieId,
            showTime,
            availableSeats,
            screen
        );

        return res.status(201).json({
            showId,
            message : "Show added successfully",
        });
    }
    catch(err){
        console.log('Error adding show to the theater ' , err);
        res.status(500).json({message : "Internal Server Error"});
    }
};



//fetch shows in a theater
exports.getTheaterShows = async(req, res)=>{
    const {theaterId} = req.params;

    try{
        const data = await TheaterModel.getTheaterShows(theaterId);
        res.status(200).json(data.items);
    }
    catch(err){
        console.log(err);
        res.status(500).json({message : 'Error fetching theater shows'});
    }
}