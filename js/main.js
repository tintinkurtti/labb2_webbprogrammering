// Enforces strict mode to catch common coding mistakes and enforce cleaner code.
"use strict";

// Base URL for accessing the SR API.
var baseURL = "https://api.sr.se/api/v2/";

// Waits for the DOM to fully load before executing scripts.
document.addEventListener("DOMContentLoaded", function(){

    // Fetches a list of SR channels and dynamically creates HTML elements to display them.
    let url = baseURL + "channels?size=100&format=json"; // Endpoint URL to fetch channel data.
    fetch(url, {method: 'GET'})
        .then(response => response.text())
        .then(data => {
            var jsonData = JSON.parse( data );
            for(var i=0; i < jsonData.channels.length; i++){
                var channelHTML = "<li id='"+jsonData.channels[i].id+"'>";
                channelHTML += "<img src='"+jsonData.channels[i].image+"' alt='"+jsonData.channels[i].name+"' style='width: 40px; height: 40px; '>";
                channelHTML += jsonData.channels[i].name+"</li>";

                document.getElementById("mainnavlist").innerHTML += channelHTML;
                document.getElementById("searchProgram").innerHTML += "<option value='"+jsonData.channels[i].id+"'>"+jsonData.channels[i].name+"</option>";
            }
        })
        .catch(error => {
            alert('There was an error '+error);
        });

    // Handles search button click event.
    document.getElementById('searchbutton').addEventListener("click", function(){
        var channelid = document.getElementById('searchProgram').value;
        let channelurl = baseURL + "scheduledepisodes?channelid=" + channelid + "&format=json";
        fetch(channelurl, {method: 'GET'})
            .then(response => response.text())
            .then(data => {
                var chanData = JSON.parse( data );
                var scheduleArray = chanData.schedule;
                document.getElementById("info").innerHTML = ""; // Clear previous content
                if (scheduleArray.length > 0) {
                    scheduleArray.forEach(episode => {
                        document.getElementById("info").innerHTML += "<h2>" + episode.title + "</h2>";
                        document.getElementById("info").innerHTML += "<h3>" + episode.description + "</h3>";
                        var startDate = new Date(parseInt(episode.starttimeutc.replace("/Date(", "").replace(")/", "")));
                        document.getElementById("info").innerHTML += "<p>" +startDate + "</p>";
                        document.getElementById("info").innerHTML += "<hr>";
                    });
                } else {
                    document.getElementById("info").innerHTML = "No episodes found for this channel.";
                }
            })
            .catch(error => {
                alert('There was an error '+error);
            });

    })

    // Creates a new audio object to play the live audio stream.
    var currentAudio = new Audio();

    // Handles clicks on the created list of channels.
    document.getElementById('mainnavlist').addEventListener("click", function(e){
        //Changes the value of the searchProgram input to the clicked channel
        document.getElementById('searchProgram').value = e.target.id;

        // Stops current audio playback if it's playing
        if (currentAudio) {
            currentAudio.pause();
        }
        
        var channelid = e.target.id;
        let channelurl = baseURL + "channels/" + channelid + "?format=json";
        let rightnowurl = baseURL + "playlists/rightnow?channelid="+channelid + "&format=json";

        // Fetches channel data from the channel.
        fetch(channelurl, {method: 'GET'})
            .then(response => response.text())
            .then(data => {
                var chanData = JSON.parse( data );
                document.getElementById("info").innerHTML = "<h2>" +chanData.channel.name+ "</h2>";
                document.getElementById("info").innerHTML += "<h3>" +chanData.channel.tagline + "</h3>";
                document.getElementById("info").innerHTML += "<hr>";

                //Fetches the current song playing on the channel.
                fetch(rightnowurl, {method: 'GET'})
                    .then(response => response.text())
                    .then(data2 => {
                        var songdata = JSON.parse( data2 );
                        if (songdata.playlist.previoussong) {
                            document.getElementById("info").innerHTML += "<p>" +
                                "Previous song: " +
                                songdata.playlist.previoussong.description+
                                "</p>";
                            if (songdata.playlist.song) {
                                document.getElementById("info").innerHTML += "<p>" +
                                    "Next song: " +
                                    songdata.playlist.song.description +
                                    "</p>";
                            } else {
                                document.getElementById("info").innerHTML += "No next song found";
                            }
                        } else {
                            document.getElementById("info").innerHTML += "No previous song found";
                        }

                        //Plays the live audio stream from the channel.
                        currentAudio.src = chanData.channel.liveaudio.url;
                        currentAudio.play();

                    })
                    .catch(error => {
                        console.error('There was an error:', error);
                    });

            })
            .catch(error => {
                alert('There was an error '+error);
            });
    })
})// End of DOM content loaded