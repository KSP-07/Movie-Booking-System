

require('dotenv').config();
const express = require('express');

const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theaterRoutes = require('./routes/theaterRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Authentication middleware 
// app.use(authenticate);

//Route Handlers
app.use('/user' , userRoutes);
app.use('/movies' , movieRoutes);
app.use('/theater' , theaterRoutes);
app.use('/booking' , bookingRoutes);

//Error handling
app.use((err, req , res , next)=>{
    console.error(err.stack);
    res.status(500).send({message : 'Something broke'});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})

