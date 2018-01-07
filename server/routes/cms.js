"use strict";function slackPost(a){request({url:process.env.SLACK_WEBHOOK_URL,method:"POST",json:!0,body:a})}var moment=require("moment-timezone"),express=require("express"),request=require("request"),router=express.Router();router.get("/",function(a,b){b.set("Access-Control-Allow-Origin","*"),b.send("API v1 GET: Hello World!")}),router.post("/",function(a,b){b.set("Access-Control-Allow-Origin","*");var c={},d=a.body["orig-bar"],e=a.body["curr-bar"],f=a.body["orig-dining"],g=a.body["curr-dining"],h=Math.floor(d/6),i=Math.floor(e/6),j=Math.floor(f/6),k=Math.floor(g/6);if(h==i&&j==k)c={update:!1,"dining-count":g,"bar-count":e,todo:"",description:""};else if(h!=i&&j!=k){var l="Both Dining and Bar CMS pages need edits on Highland",m="The dining page requires "+k+" pages and the bar page requires "+i+" pages.";c={update:!0,"dining-count":g,"bar-count":e,todo:l,description:m}}else{if(h!=i){var l="Change Bar page count on Highland",m="The bar page requires "+i+" pages.";c={update:!0,"dining-count":g,"bar-count":e,todo:l,description:m}}if(j!=k){var l="Change Dining page count on Highland",m="The dining page requires "+k+" pages.";c={update:!0,"dining-count":g,"bar-count":e,todo:l,description:m}}}var n={attachments:[{pretext:"Highland Chair Co. Weekly CMS Checker",username:"cms-bot"},{pretext:"CMS Counts",title:"CMS Counts for all collections",text:"All of the original counts from the last check and the updates",fields:[{title:"Original Bar CMS item count:",value:d,"short":!0},{title:"Current Bar CMS item count:",value:e,"short":!0},{title:"Original Dining CMS item count:",value:f,"short":!0},{title:"Current Dining CMS item count:",value:g,"short":!0}]},{pretext:"Pagination page counts",title:"Pagination page counts",text:"The original and current page counts for both CMS display pages",fields:[{title:"Original Bar page count:",value:h,"short":!0},{title:"Current Bar page count:",value:i,"short":!0},{title:"Original Dining page count:",value:j,"short":!0},{title:"Current Dining page count:",value:k,"short":!0}]}]};slackPost(n),b.send(c)}),module.exports=router;