//file for handling html routes 
//note: use raw:true when json data needed (such as when rendering html)

const express = require("express");
const router = express.Router();
const db = require("../models")

//home page is login
router.get("/",(req,res)=> {
    res.render("login"); 
})

//login page 
router.get("/login",(req,res)=> {
    res.render("login"); 
})

//signup page
router.get("/signup",(req,res)=> {
    res.render("login"); 
})

//only logged in users should see the profile page; otherwise, they are redirected to the create acc page 
router.get("/profile",(req,res)=>{
  if(req.session.user) {
      db.TournamentBracket.findAll({
        where: {
          UserId: req.session.user.id
        }
      }).then(dbBracket=>{
        const hbsObj= {
          user:req.session.user,
          brackets: dbBracket
        }; 
        
        res.render("profile",hbsObj)
      }) 
  } else {
      res.render("login"); 
  }
})


//all tournaments
router.get("/allbrackets",(req,res)=>{
  db.TournamentBracket.findAll({
    include:[db.Option]
  }).then(dbBrackets=>{
    const jsonbrackets = dbBrackets.map(function(bracket) {
      return bracket.toJSON(); 
    })
    const hbsObj= {brackets:jsonbrackets}; 
    
    res.render("allbrackets",hbsObj)
  }) 
})

//only logged in users should see the profile page; otherwise, they are redirected to the create acc page 
//new bracket page 
router.get("/newbracket",(req,res)=>{
    if(req.session.user) {
        res.render("newbracket"); 
    }
    else {
      res.render("login"); 
    }
})

//specific bracket 
router.get("/brackets/:id",(req,res)=>{
    db.TournamentBracket.findOne({
        where:{
        id:req.params.id
    },include:[db.MatchUp,db.Option]
    }).then(dbBracket=>{
    
    let round1 = true;
    let round2 = false; 
    let round3 = false; 
    let winner = false;
    if(dbBracket.current_round === 0) {
      winner = true; 
      round3 = true;
      round2 = true;
    }
    else if(dbBracket.current_round === 3) {
      round3 = true;
      round2 = true; 
    }
    else if(dbBracket.current_round === 2) {
      round2 = true; 
    }
    
    const hbsObj = {round1,round2,round3,winner,dbBracket}
    res.render("bracket",hbsObj); 
    
    //res.render("bracket",{...dbBracket.dataValues})
  }).catch(err=> {
    console.log(err); 
    res.json('NO TOURNAMENTS BY THAT ID')})
})


module.exports = router;