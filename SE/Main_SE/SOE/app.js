//https://www.chartjs.org/docs/latest/
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');
app.use(express.static("public"));

//var flag1,flag2;

////////////////////////////////////////////////////////////////////////////////
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
        //                  attributes.  *NOTE* month is 0-11.
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
  res.sendFile(__dirname + "/index.html");
});

app.get("/display", function(req,res){
  res.sendFile(__dirname + "/display.html")
});

app.post("/", function(req,res){
  var from = req.body.startDate;
  var to = req.body.endDate;
  var fromDate = new Date(from).toLocaleDateString("en-US");
  var toDate = new Date(to).toLocaleDateString("en-US");

  const url = "http://localhost:4200/buildingTemp";
  http.get(url,function(response){
    response.on("data",function(data){
      const tempData = JSON.parse(data);

      var maxTempTillNow = -Infinity;
      var minTempTillNow = Infinity;

      for(var i=0;i<12;i++){
         const date = tempData.buildingTempRecords[i].date;
         //console.log(tempData.buildingTempRecords[9].date);
         var dateCheck = new Date(date).toLocaleDateString("en-US");

         var minTemp = tempData.buildingTempRecords[i].min;
         var maxTemp = tempData.buildingTempRecords[i].max;

         // console.log(tempData.buildingTempRecords[9].max);
         // console.log(tempData.buildingTempRecords[10].max);
         // console.log(tempData.buildingTempRecords[11].max);
         //buildingTempRecords[11].max;
         if(dates.compare(dateCheck,fromDate)>=0 && dates.compare(dateCheck,toDate)<=0){
         //if(dateCheck>=fromDate && dateCheck<=toDate){
           if(maxTemp > maxTempTillNow){
             maxTempTillNow = maxTemp;
           }
           if(minTemp < minTempTillNow){
             minTempTillNow = minTemp;
           }
          //console.log("Hello");
         }
         //console.log(dateCheck,fromDate,toDate,minTempTillNow,maxTempTillNow,maxTemp,minTemp);
      }
      // res.write("Maximum Temperature between "+ fromDate + " to " + toDate + " : " + maxTempTillNow + "\n");
      // res.write("Minimum Temperature between "+ fromDate + " to " + toDate + " : " + minTempTillNow + "\n");
      // res.send();

         res.render("viewTemp",{maxT: maxTempTillNow ,  minT: minTempTillNow , fromDate: fromDate, toDate: toDate});

      //buildingTempRecords[0].time
      //buildingTempRecords[0].temperature
    })
  })
});


app.listen(3000, function(){
  console.log("Server is running on port 3000!");
});
