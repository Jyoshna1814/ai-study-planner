const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

/* DB */
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

/* USER MODEL */
const UserSchema = new mongoose.Schema({
  email:String,
  password:String
});

const User = mongoose.model("User", UserSchema);

/* SUBJECT MODEL */
const SubjectSchema = new mongoose.Schema({
  subject:String,
  hours:Number
});

const Subject = mongoose.model("Subject", SubjectSchema);

/* AUTH ROUTES */

// SIGNUP
app.post("/signup", async(req,res)=>{
  const {email,password} = req.body;

  const exist = await User.findOne({email});
  if(exist) return res.send("User already exists");

  await User.create({email,password});
  res.send("Signup success");
});

// LOGIN
app.post("/login", async(req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({email,password});
  if(!user) return res.send("Invalid credentials");

  res.send("Login success");
});

/* SUBJECT SAVE */
app.post("/save", async(req,res)=>{
  await Subject.deleteMany({});
  await Subject.insertMany(req.body);
  res.send("Saved");
});

app.get("/get", async(req,res)=>{
  const data = await Subject.find();
  res.json(data);
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, ()=>console.log("Server running on", PORT));