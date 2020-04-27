const express = require("express");
const router = express.Router();
const db = require("../models");
const bcrypt = require("bcrypt"); 



//create new user - TODO: delete password
router.post("/signup",(req,res)=> {
    db.User.create({
        username:req.body.username,
        password:req.body.password,
    }).then(newDbUser=>{
        //create a session with the new user 
        req.session.user = {
            username:newDbUser.username,
            id: newDbUser.id
        }; 
        //TODO - this should redirect to the profile page 
        res.redirect("/profile")
    }).catch(err=> {
        console.log(err); 
        res.status(500).json(err); 
    });
}); 

router.post("/login",function(req,res) {
    db.User.findOne({
        where: {
            username:req.body.username
        }
    }).then(dbUser=>{
        if(bcrypt.compareSync(req.body.password,dbUser.password)) {
            req.session.user = {
                username:dbUser.username,
                id: dbUser.id
            }; 
            res.redirect("/profile")
            // res.send("logged in")
        }
        else {
            res.send("not logged in")
        }
    });
}); 

router.get("/logout",function(req,res) {
    req.session.destroy(function(err) {
        res.redirect("/login"); 
    }); 
});




// router.get("/readsessions",function(req,res){
//     res.json(req.session); 
// })

module.exports = router;