const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
   firstname : {
     type:String,
     required:true
   },
   email : {
     type:String,
     required:true,
     unique:true
   },
   phone : {
     type:Number,
     required:true,
     unique:true
   }
})

const Register = new mongoose.model("Register",contactSchema);

module.exports = Register;
