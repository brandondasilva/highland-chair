"use strict";const express=require("express"),PORT=process.env.PORT||3e3;var app=express(),bodyParser=require("body-parser"),helmet=require("helmet");app.set("port",PORT),app.use(express["static"](__dirname+"/public")),app.use(bodyParser.json()),app.use(bodyParser.urlencoded({extended:!0})),app.use(helmet());var contact=require("./routes/contact");app.use("/contact",contact),app.get("/",function(a,b){b.set("Access-Control-Allow-Origin","*"),b.send("ok")}),app.listen(app.get("port"),function(){console.log("Node app is running on port",app.get("port"))});