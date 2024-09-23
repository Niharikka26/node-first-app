import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


mongoose.connect("mongodb://localhost:27017", {
  dbName:"Backend"}).then(()=>console.log("Database is connected")).catch((e)=>console.log(e));

const app=express();

const userSchema= new mongoose.Schema({
  name: String,
  email: String,
  password: String,
})

const User=mongoose.model("User",userSchema);

// const user=[];
//Using Middlewares
app.use(express.static(path.join(path.resolve(),"public"))); 
app.use(express.urlencoded({ extended: true})); //To access data from form
app.use(cookieParser());

//Setting up the engine
app.set("view engine","ejs");

// app.get("/add",async (req,res)=>{
// Creating Document
//   await Messge.create({name:"Niharika2",email:"Sample123@gmail.com"});
//     res.send("Nice");
// });

//(Handler)to make a protected route , so that only user which is logged in can access , and is a middleware
const isAuthenticated= async(req,res,next)=>{
  const { token } =req.cookies;
 if(token)
 { 
  const decoded=jwt.verify(token,"xbuychdikhwdhiesdi");
  //console.log(decoded);
  req.user= await User.findById(decoded._id);
  next();
 } else {
  res.redirect("/login");
 }
}

app.get("/",isAuthenticated,(req,res)=>{
  // console.log(req.user);
  // console.log(req.cookies);
  res.render("logout",{name:req.user.name});
});

app.get("/register",(req,res)=>{
  res.render("register");
})

app.get("/login", (req,res)=>{
  res.render("login");
})

app.post("/login", async(req,res)=>{
  const {name,email,password}= req.body;
  let user=await User.findOne({email});
  if(!user) return res.redirect("/register");
  const isMatch= await bcrypt.compare(password,user.password);
  if(!isMatch)
  return res.render("login",{email,message:"Incorrect password"});
  const token=jwt.sign({_id:user._id},"xbuychdikhwdhiesdi");

  res.cookie("token",token ,{httpOnly:true,
     expires: new Date(Date.now()+60*1000)});
  res.redirect("/");
})

app.post("/register",async (req,res)=>{
  const {name,email,password}=req.body;
  let user= await User.findOne({email});
  if(user)
    return res.redirect("/login");

  const hashedPassword=await bcrypt.hash(password,10);
   user = await User.create({
     name,email,password:hashedPassword});

  const token=jwt.sign({_id:user._id},"xbuychdikhwdhiesdi");

  res.cookie("token",token ,{httpOnly:true,
     expires: new Date(Date.now()+60*1000)});
  res.redirect("/");
})

app.get("/logout",(req,res)=>{
  res.cookie("token",null,
  {httpOnly:true,
     expires: new Date(Date.now())});
  res.redirect("/login");
})



// app.get("/success",(req,res)=>{
//   res.render("success");
// });
// app.get("/users",(req,res)=>{
//   res.json({user,});
// });

// app.post("/contact",async (req,res)=>{
//   console.log(req.body);
//   // user.push({username: req.body.name},{email: req.body.email});
//   const{name,email}=req.body;
//   await User.create({name,email});
//   res.redirect("/success");
// })

app.listen(3000,()=>{
  console.log("Server is Working");
})