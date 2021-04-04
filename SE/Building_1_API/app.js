const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const buildingRoutes = require('./api/routes/buildingTemp');

mongoose.connect('mongodb+srv://node:node@cluster0.hgaom.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{
   //useMongoClient: true,
   useNewUrlParser: true,
   useUnifiedTopology: true
});

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise; // To remove Deprication Warning

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req,res,next) => {
  res.header("Access-Control-Allow-Origin","*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With,Content-Type,Accept,Authorization"
  );
  if(req.method === 'OPTIONS'){
    res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
    return res.status(200).json({});
  }
  next();
});

app.use('/buildingTemp', buildingRoutes);


//To handle every request that reaches this line
app.use((req,res,next) => {
  const error = new Error('Not found');
  error.status(404);
  next(error); //execute the next method with error as a parameter
})

app.use((error,req,res,next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  })
})

module.exports = app;
