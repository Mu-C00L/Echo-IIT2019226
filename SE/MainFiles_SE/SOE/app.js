const express = require('express');
const app = express();
const bodyParser = require('body-parser');//to parse the information received from the forms.
const http = require('http');
const { pseudoRandomBytes } = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');
app.use(express.static("public"));

var minArr = [];
var maxArr = [];

//////////////////////////////////////////////////////////////////////////////////////////
var dates = {
    convert:function(d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp)
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  NOTE month is 0-11.
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
    },
    compare:function(a,b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    },
    inRange:function(d,start,end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
       return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
    }
}
////////////////////////////////////////////////////////////////////////////////

app.get("/", function(req,res){
  res.sendFile(__dirname + "/home.html");
});
app.get("/index",async function(req,res){
  res.sendFile(__dirname + "/index.html");
})

app.post("/", function(req,res){
  var name = req.body.buildingName;
  var location = req.body.buildingLocation;
  var from = req.body.startDate;
  var to = req.body.endDate;
  var fromDate = new Date(from).toLocaleDateString("en-US");
  var toDate = new Date(to).toLocaleDateString("en-US");

  var url="";
  if(name == "Royal Castle Luxury Residential Apartments"){
    url = "http://localhost:4200/buildingTemp";
  }
  else if(name == "Heritage Luxury Residential Apartments"){
    url = "http://localhost:4200/buildingTemp";
  }
  else if(name == "Atlantis Luxury Residential Apartments"){
    url = "http://localhost:4200/buildingTemp";
  }
  else if(name == "Anselm's Luxury Residential Apartments"){
    url = "http://localhost:4200/buildingTemp";
  }
  else if(name == "Argus Homes Residential Apartments"){
    url = "http://localhost:4200/buildingTemp";
  }
  else{
    res.write("Sorry for the inconvinience");
    res.write("This building is not associated with this website!!");
    res.send();
  }

  http.get(url,function(response){
    response.on("data",function(data){
      const tempData = JSON.parse(data);

      var maxTempTillNow = -Infinity;
      var minTempTillNow = Infinity;
      var dateArray = [];

      var pumpkin = new Array();
      var pumpkinDay = new Array();

      for(var i=0;i<38;i++){
         const dateI = tempData.buildingTempRecords[i].date;

         var dateCheck = new Date(dateI).toLocaleDateString("en-US");

         var minTemp = tempData.buildingTempRecords[i].min;
         var maxTemp = tempData.buildingTempRecords[i].max;

         var maxDate,minDate,idxMax,idxMin;
         if(dates.compare(dateCheck,fromDate)>=0 && dates.compare(dateCheck,toDate)<=0){
           dateArray.push([dateI]);
           minArr.push(minTemp);
           maxArr.push(maxTemp);

          if(maxTemp > maxTempTillNow){
            maxTempTillNow = maxTemp;
            maxDate = dateCheck;
          }
          if(minTemp < minTempTillNow){
            minTempTillNow = minTemp;
            minDate = dateCheck;
          }

            let start = new Date(dateI).getTime();
            pumpkinDay.push(start, maxTemp, minTemp)

            for (var j=0; j<24; j++){
              var pair = new Array([start+j*3600000, tempData.buildingTempRecords[i].temperature[j]])
              pumpkin.push(pair)
            }
         }

         if(dateCheck===maxDate){
                   for(var j=0;j<24;j++){
                     var currTemp = tempData.buildingTempRecords[i].temperature[j];
                     if(maxTempTillNow==currTemp){
                       idxMax = j;
                     }
                 }
               }

         if(dateCheck===minDate){
                 for(var j=0;j<24;j++){
                   var currTemp = tempData.buildingTempRecords[i].temperature[j];
                   if(minTempTillNow==currTemp){
                     idxMin = j;
                   }
               }
             }
      }

      if(maxTempTillNow >= 45.8){
      var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: 'sender@gmail.com',
          pass: 'authenticatedPassword'
        }
      }));

      var mailOptions = {
        from: 'sender@gmail.com',
        to: 'receiver@gmail.com',
        subject: 'Sudden Temperature Rise Observed!',
        text: 'Hey, a sudden temperature rise has been detected in your Apartment.Kindly take immediate actions.'
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      }

         res.render("viewTemp",
         {
           pumpkin: {arr: new Array(pumpkin)},
           pumpkinDay: pumpkinDay,
           maxT: maxTempTillNow,
           minT: minTempTillNow,
           fromDate: fromDate,
           toDate: toDate,
           name: name,
           location: location,
           maxArr: maxArr,
           minArr: minArr,
           dateArray: dateArray,
           maxDate: maxDate,
           minDate: minDate,
           idxMax: idxMax,
           idxMin: idxMin
         });
      })
   })
});

app.listen(3000, function(){
  console.log("Server is running on port 3000!");
});



















































// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const http = require('http');
// const { pseudoRandomBytes } = require('crypto');
//
// app.use(bodyParser.urlencoded({extended: true}));
// app.set('view engine','ejs');
// app.use(express.static("public"));
//
// var minArr = [];
// var maxArr = [];
//
// ////////////////////////////////////////////////////////////////////////////////
// var dates = {
//     convert:function(d) {
//         // Converts the date in d to a date-object. The input can be:
//         //   a date object: returned without modification
//         //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
//         //   a number     : Interpreted as number of milliseconds
//         //                  since 1 Jan 1970 (a timestamp)
//         //   a string     : Any format supported by the javascript engine, like
//         //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
//         //  an object     : Interpreted as an object with year, month and date
//         //                  attributes.  NOTE month is 0-11.
//         return (
//             d.constructor === Date ? d :
//             d.constructor === Array ? new Date(d[0],d[1],d[2]) :
//             d.constructor === Number ? new Date(d) :
//             d.constructor === String ? new Date(d) :
//             typeof d === "object" ? new Date(d.year,d.month,d.date) :
//             NaN
//         );
//     },
//     compare:function(a,b) {
//         // Compare two dates (could be of any type supported by the convert
//         // function above) and returns:
//         //  -1 : if a < b
//         //   0 : if a = b
//         //   1 : if a > b
//         // NaN : if a or b is an illegal date
//         // NOTE: The code inside isFinite does an assignment (=).
//         return (
//             isFinite(a=this.convert(a).valueOf()) &&
//             isFinite(b=this.convert(b).valueOf()) ?
//             (a>b)-(a<b) :
//             NaN
//         );
//     },
//     inRange:function(d,start,end) {
//         // Checks if date in d is between dates in start and end.
//         // Returns a boolean or NaN:
//         //    true  : if d is between start and end (inclusive)
//         //    false : if d is before start or after end
//         //    NaN   : if one or more of the dates is illegal.
//         // NOTE: The code inside isFinite does an assignment (=).
//        return (
//             isFinite(d=this.convert(d).valueOf()) &&
//             isFinite(start=this.convert(start).valueOf()) &&
//             isFinite(end=this.convert(end).valueOf()) ?
//             start <= d && d <= end :
//             NaN
//         );
//     }
// }
// ////////////////////////////////////////////////////////////////////////////////
//
// app.get("/", function(req,res){
//   res.sendFile(__dirname + "/index.html");
// });
//
// app.post("/", function(req,res){
//   var name = req.body.buildingName;
//   var location = req.body.buildingLocation;
//   var from = req.body.startDate;
//   var to = req.body.endDate;
//   var fromDate = new Date(from).toLocaleDateString("en-US");
//   var toDate = new Date(to).toLocaleDateString("en-US");
//
//   var url="";
//   if(name == "Royal Castle Luxury Residential Apartments"){
//     url = "http://localhost:4200/buildingTemp";
//   }
//   else if(name == "Heritage Luxury Residential Apartments"){
//     url = "http://localhost:4200/buildingTemp";
//   }
//   else if(name == "Atlantis Luxury Residential Apartments"){
//     url = "http://localhost:4200/buildingTemp";
//   }
//   else if(name == "Anselm's Luxury Residential Apartments"){
//     url = "http://localhost:4200/buildingTemp";
//   }
//   else if(name == "Argus Homes Residential Apartments"){
//     url = "http://localhost:4200/buildingTemp";
//   }
//   else{
//     res.send("<center><h1>Sorry for the inconvinience.This building is not associated with our website.</h1></center>")
//   }
//
//   http.get(url,function(response){
//     response.on("data",function(data){
//       const tempData = JSON.parse(data);
//
//       var maxTempTillNow = -Infinity;
//       var minTempTillNow = Infinity;
//       var dateArray = [];
//
//       var pumpkin = new Array();
//       var pumpkinDay = new Array();
//
//       for(var i=0;i<38;i++){
//          const dateI = tempData.buildingTempRecords[i].date;
//
//          var dateCheck = new Date(dateI).toLocaleDateString("en-US");
//
//          var minTemp = tempData.buildingTempRecords[i].min;
//          var maxTemp = tempData.buildingTempRecords[i].max;
//
//          minArr.push(minTemp);
//          maxArr.push(maxTemp);
//
//          if(dates.compare(dateCheck,fromDate)>=0 && dates.compare(dateCheck,toDate)<=0){
//            // dateArray.push(dateCheck);
//            // minArr.push(minTemp);
//            // maxArr.push(maxTemp);
//
//            if(maxTemp > maxTempTillNow){
//              maxTempTillNow = maxTemp;
//            }
//            if(minTemp < minTempTillNow){
//              minTempTillNow = minTemp;
//            }
//
//             let start = new Date(dateI).getTime();
//
//             pumpkinDay.push(start, maxTemp, minTemp)
//
//             for (var j=0; j<24; j++){
//               var pair = new Array([start+j*3600000, tempData.buildingTempRecords[i].temperature[j]])
//               pumpkin.push(pair)
//             }
//          }
//
//       }
//
//          res.render("viewTemp",
//          {
//            pumpkin: {arr: new Array(pumpkin)},
//            pumpkinDay: pumpkinDay,
//            maxT: maxTempTillNow,
//            minT: minTempTillNow,
//            fromDate: fromDate,
//            toDate: toDate,
//            name: name,
//            location: location,
//            maxArr: maxArr,
//            minArr: minArr,
//            dateArray: dateArray
//          });
//     })
//   })
// });
//
// app.listen(3000, function(){
//   console.log("Server is running on port 3000!");
// });
