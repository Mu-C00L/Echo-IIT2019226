const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");

require("./db/conn");
const Register = require("./models/registers");
const { json } = require("express");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);

app.get("/",(req,res) => {
  res.render("index");
});

app.get("/register",(req,res) => {
  res.render("register");
});
app.get("/login",(req,res) => {
  res.render("login");
});

app.post("/register", async (req,res) => {

     const contactDetails = new Register({
       firstname: req.body.firstname,
       email: req.body.email,
       phone: req.body.phone
     })

    const registered = await contactDetails.save();
    res.status(201).render("index");
 //res.redirect("/login");
})

app.listen(port,() => {
  console.log(`Server is running on port ${port}`);
})
