$('.message a').click(function() {
    $('form').animate({ height: "toggle", opacity: "toggle" }, "slow");
});


var loadFile = function(event) {
    var image = document.getElementById('output');
    image.src = URL.createObjectURL(event.target.files[0]);
};

//frontend javascript to make ajax calls 
$(function () {
    //new user front end
    $("#create-acc").on("click", function (event) {
        event.preventDefault();
        let newUser = {
            username: $("#create-name").val(),
            password: $("#create-password").val(),
        }
        $.ajax({
            method: "POST",
            data: newUser,
            url: "/signup"
        }).then(function () {
            //after signup, log user in 
            $.ajax({
                method: "POST",
                data: newUser,
                url: "/login"
            }).then(function () {
                localStorage.clear() 
                //redirect to profile page 
                location.href = "/profile";
            })
            
        })
    })

    //login button
    $("#login-acc").on("click", function (event) {
        event.preventDefault();
        let user = {
            username: $("#login-name").val(),
            password: $("#login-password").val(),
        }
        $.ajax({
            method: "POST",
            data: user,
            url: "/login"
        }).then(function () {
            localStorage.clear() 
            location.href = "/profile";
        })
    })

    //new bracket
    $("#submit-btn").on("click", function (event) {
        event.preventDefault();
        optionsArry = [];
        option_one = $("#option_one").val().trim();
        option_two = $("#option_two").val().trim();
        option_three = $("#option_three").val().trim();
        option_four = $("#option_four").val().trim();
        option_five = $("#option_five").val().trim();
        option_six = $("#option_six").val().trim();
        option_seven = $("#option_seven").val().trim();
        option_eight = $("#option_eight").val().trim();

        optionsArry.push(option_one, option_two, option_three, option_four, option_five, option_six, option_seven, option_eight);

        let newBracket = {
            name: $("#bracket_name").val().trim(),
            options: optionsArry
        }
        $.ajax({
            method: "POST",
            data: newBracket,
            url: "api/tournamentbracket/new"
        }).then(function (res) {
            location.href = "/brackets/" + res.id; 
        })
    })

    $(".vote").on("click", function (event) {
        let votingFor = $(this).data('for')
        
        const voted = JSON.parse(localStorage.getItem(votingFor)); 
        
        if(voted === null || voted === false) {
            
            let notVotingFor = $(this).data('not'); 
            let roundVotingFor = parseInt($(this).data("rd")); 
            let bracketId = $(this).data("id")
            let changed = false; 

        
            const otherVoted = JSON.parse(localStorage.getItem(notVotingFor)); 
        
            //if we voted for the other option  
            if(otherVoted !== null && otherVoted === true) {
                //change other option to NOT voted for 
                localStorage.setItem(notVotingFor,JSON.stringify(false));
                //need to signal to backend that we have changed vote
                changed = true; 
            }
            //change option picked to true 
            localStorage.setItem(votingFor,JSON.stringify(true))
            
            let votes= {
                votingFor: votingFor,
                notVotingFor: notVotingFor,
                changed: changed
            }
            //first figure out current tournamentround 
            $.ajax({
                method: "GET",
                url: "/api/tournamentbracket/" + bracketId
            }).then(function (res) {
                //only update votes if they are voting on correct round 
                if(res.current_round === roundVotingFor) {
                    $.ajax({
                        method: "PUT",
                        data: votes,
                        url: "/api/tournamentbracket/vote/" + bracketId
                    }).then(function () {
                        location.reload(); 
                    })
                }
            })
        }
    })

    //update round/ advance round
    $(".end-rd").on("click", function (event) {
        let nextRound = $(this).data("rd")
        let id = $(this).data('id'); 
        
        let currentRound = $("#bracket-info").data("round"); 
        

        //only do anything if the current round matches corresponding button
        if(currentRound === nextRound - 1 && currentRound !== 0) {
            //clear out local storage so user can vote on next round 
            //in the future, need to think of a better solution 
            localStorage.clear(); 

            $.ajax({
                method: "PUT",
                data: {nextRound},
                url: "/api/tournamentbracket/nextround/" + id
            }).then(function () {
                location.reload(); 
            })
        }  
    })

    //close bracket
    $(".close-btn").on("click", function (event) {
        
        let id = $(this).data("id")

        $.ajax({
            method: "PUT",
            url: "/api/tournamentbracket/close/" + id
        }).then(function () {
            location.reload(); 
        })
    })
    
})