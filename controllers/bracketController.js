const express = require("express");
const router = express.Router();
const db = require("../models")
const sequelize = require("sequelize"); 


//create new bracket
// route: /api/tournamentbracket/new
router.post("/new",(req,res)=> {
    //create the bracket 
    db.TournamentBracket.create({
        name: req.body.name,
        current_round: 1, 
        UserId: req.session.user.id, 
        is_complete: false,
        winner: null 

    }).then(newDbTournamentBracket=>{
        //res.status(200).json(newDbTournamentBracket);
        const tournamentID = newDbTournamentBracket.id;
        //array of options passed from the front end 
        const {options} = req.body; 
        //number of users options - for now, hardcoded as 8 
        
        //create each option 
        for(let i = 0; i < options.length; i++) {
            db.Option.create({
                TournamentBracketId: tournamentID,
                name: options[i]
                

            }).then(function (newDbOption) {
                
            }); 
        }

        //create matchups
        let bracketNum = 0; 
        for(let i = 0; i < options.length; i+=2) {
            bracketNum++; 
            db.MatchUp.create({
                TournamentBracketId: tournamentID,
                //start at round 1
                round: 1,
                bracket: bracketNum,
                option1: options[i],
                option2: options[i+1], 
                option1_votes: 0, 
                option2_votes: 0
            }).then(function (newDbMatchup) {
                
            })
            
        }
        res.status(200).send(newDbTournamentBracket);         
            
    }).catch(function(err) {
        console.log(err); 
        res.sendStatus(500); 
    })
}); 

//get a specific bracket by ID
// route: /api/tournamentbracket/:id
router.route("/:id").get((req,res)=>{
    db.TournamentBracket.findOne({
        where:{
            id:req.params.id
        },
        
        include:[db.MatchUp,db.Option]
    }).then(dbTournamentBracket=>{
        res.json(dbTournamentBracket)
    })
});

// route: /api/tournamentbracket/nextround/:id
//update a bracket to advance to the next round 
router.route("/nextround/:id").put((req,res)=>{
    //front end will pass a number indicating the next round number 
    const nextRound = (req.body.nextRound); 
    
    //find query for the tournament, including the matchups 
    db.TournamentBracket.findOne({
        where:{
            id:req.params.id
        },
        
        include:[
            {
                model: db.MatchUp,
                where: {
                    round: nextRound-1
                }
            },db.Option]
    }).then(dbTournamentBracket=>{
        const matchUps = dbTournamentBracket.MatchUps; 
        const winners = []; 
        let lastBracket = 0; 
        //loop through each matchup, find and assign winner 
        for(let i = 0; i < matchUps.length; i++) {
            let roundWinner = null;  
            if(matchUps[i].option1_votes > matchUps[i].option2_votes) {
                roundWinner = matchUps[i].option1;
            }
            else if(matchUps[i].option1_votes < matchUps[i].option2_votes) {
                roundWinner = matchUps[i].option2;
            }
            //tie event 
            else {
                const rand = Math.random(); 
                if(rand === 0) {
                    roundWinner = matchUps[i].option1;
                }
                else {
                    roundWinner = matchUps[i].option2;
                }
            }
            //add winners to an array 
            winners.push(roundWinner); 
            //store last bracket number 
            lastBracket = matchUps[i].bracket; 
            //update matchup query (add winner)
            db.MatchUp.update({
                winner: roundWinner
            },{
                where:{
                    id: matchUps[i].id
                }
            }).then(updatedMatchUp=>{
                
            }); 
            
        }
        //create next matchups
        let bracketNum = lastBracket; 
        for(let i = 0; i < winners.length; i+=2) {
            bracketNum++; 
            db.MatchUp.create({
                TournamentBracketId: req.params.id,
                round: nextRound,
                bracket: bracketNum,
                option1: winners[i],
                option2: winners[i+1], 
                option1_votes: 0, 
                option2_votes: 0
            }).then(function (newDbMatchup) {
                
            })
        }
        res.status(200); 
    })  

    //update TournamentBracket.current_round to next round 
    db.TournamentBracket.update({
        current_round: nextRound
    },{
        where:{
            id:req.params.id
        }
    }).then(updatedDbTournamentBracket=>{
        res.status(200).json(updatedDbTournamentBracket);
    })
});

// route: /api/tournamentbracket/vote/:id
//update a bracket to change votes 
router.route("/vote/:id").put((req,res)=>{
    const votingFor = req.body.votingFor; 
    const notVotingFor = req.body.notVotingFor; 
    const changed = req.body.changed;
    
    
    db.MatchUp.findOne({
        where:{
            TournamentBracketId:req.params.id,
            [sequelize.Op.or]: [{option1: votingFor,option2:notVotingFor},{option1:notVotingFor,option2:votingFor}]
        }
    }).then(dbFoundMatchUp=>{
        
        let option1Votes = dbFoundMatchUp.option1_votes; 
        let option2Votes = dbFoundMatchUp.option2_votes; 
        const option1 = dbFoundMatchUp.option1;
        const option2 = dbFoundMatchUp.option2; 

        if(option1 === votingFor) {
            option1Votes++;
            if(changed === "true") {
                option2Votes--; 
            } 
        }
        else {
            option2Votes++; 
            if(changed === "true") {
                option1Votes--; 
            }
        }
        
        db.MatchUp.update({
            option1_votes: option1Votes, 
            option2_votes: option2Votes
        },{
            where:{
                TournamentBracketId:req.params.id,
                [sequelize.Op.or]: [{option1: votingFor,option2:notVotingFor},{option1:notVotingFor,option2:votingFor}]
            }   
        }).then(dbMatchUp=>{  
            res.send("vote updated"); 
        });            
    })          
});

// route: /api/tournamentbracket/close/:id
//update a bracket to close
router.route("/close/:id").put((req,res)=>{
    //query for tournament including matchups 
    db.TournamentBracket.findOne({
        where:{
            id:req.params.id
        },
        
        include:[db.MatchUp,db.Option]
    }).then(dbTournamentBracket=>{
        //get winner from last matchup (will be at the last index)
        const matchUps = dbTournamentBracket.MatchUps; 
        const lastMatchUp = matchUps[matchUps.length - 1]; 
        let roundWinner = null; 

        
        if(lastMatchUp.option1_votes > lastMatchUp.option2_votes) {
            roundWinner = lastMatchUp.option1;
        }
        else if(lastMatchUp.option1_votes < lastMatchUp.option2_votes) {
            roundWinner = lastMatchUp.option2;
        }
        //tie event 
        else {
            const rand = Math.random(); 
            if(rand === 0) {
                roundWinner = lastMatchUp.option1;
            }
            else {
                roundWinner = lastMatchUp.option2;
            }
        }
        //update matchup query (add winner)
        db.MatchUp.update({
            winner: roundWinner
        },{
            where:{
                id: lastMatchUp.id
            }
        }).then(updatedMatchUp=>{
            //update tournamnet
            db.TournamentBracket.update({
                current_round: 0, 
                is_complete: true,
                winner: roundWinner
            },{
                where:{
                    id:req.params.id
                }
            }).then(updatedDbTournamentBracket=>{
                res.status(200).json(updatedDbTournamentBracket);
            })
        }); 
    }); 
});


// route: /api/tournamentbracket/:id
//delete a bracket 
router.route("/:id").delete((req,res)=>{
    db.TournamentBracket.destroy({
        where:{
            id:req.params.id
        }
    }).then(deletedTournamentBracket=>{
        res.status(200).json(deletedTournamentBracket);
    })
})

module.exports = router;


