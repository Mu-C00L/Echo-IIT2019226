const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Temp = require("../models/temp");

//Display all the data(Date and temp on that date) and the number of entries
router.get("/", (req, res, next) => {
  Temp.find()
    .select("_id date time temperature max min")
    .exec()
    .then(docs => {

      const response = {
        count: docs.length,
        buildingTempRecords: docs.map(doc => {
          return {
            date: doc.date,
            time: doc.time,
            temperature: doc.temperature,
            max: doc.max,
            min: doc.min,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/buildingTemp/" + doc._id
            }
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

//To handle post request from the user - take name and price of product user wants to store in the database
router.post("/", (req, res, next) => {
  var temps = [];
  var min = 60;
  var max = 0;
  for(var i=0;i<24;i++){
    var precision = 10; // 1 decimal place
    //var randomnum = Math.floor(Math.random() * (45 * precision - 32 * precision) + 1 * precision) / (1*precision);
    //Math.floor(Math.random() * (max - min + 1) + min);
    var randomnum = Math.floor(Math.random() * (45*precision - 32*precision + 1*precision) + 32*precision)/ (1*precision) ;

    if(randomnum > max){
      max = randomnum;
    }
    else if(randomnum < min){
      min = randomnum;
    }

    temps.push(randomnum);
  }

  const temp = new Temp({
    _id: new mongoose.Types.ObjectId(),
    date: req.body.date,
    time: ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"],
    temperature: temps,
    max: max,
    min: min
  });
  temp
    .save()
    .then(result => {
      res.status(201).json({
        message: "Stored temperature data on a particular date and time successfully!",
        createdData: {
            date: result.date,
            time: result.time,
            temperature: result.temperature,
            max: result.max,
            min: result.min,
            _id: result._id,
            request: {
                type: 'POST',
                url: "http://localhost:3000/buildingTemp/" + result._id
            }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

 module.exports = router;
