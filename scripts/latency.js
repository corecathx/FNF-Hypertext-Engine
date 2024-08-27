var chart = null;
var camHUD = document.getElementById("camHUD");
var latencySpr = null;

var allowUpdate = false;

var tickSound = new Audio("./assets/sounds/hitsound.ogg");
create = () => {
    trace("Hi");
    const urlParams = new URLSearchParams(window.location.search);
    let sng = urlParams.get('song');
    if (!sng) {
        alert("Please specify a song first.");
        document.body.remove();
    }
    loadSong(sng ? sng : "Deb8");

    latencySpr = document.getElementById("latency-scroll");
    allowUpdate = true;

    for (let i = 0; i < 4; i++) {
        let spr = document.createElement("div");
        spr.id = "latency-mark";
        spr.style.top = `${20+(((((100/4))*0.6)*i))}%`;
        document.getElementById("latencyBox").appendChild(spr);
    }
}

update = () => {
    if (!allowUpdate) return;
    if (game.input.keyPressed(" ")) {
        audio.play();
        secAud.play();
    }

    latencySpr.style.top = `${20+((game.conduct.time % (game.conduct.crochet*4))/(game.conduct.crochet*4))*(100-(20*2))}%`;
    latencySpr.style.backgroundColor = `rgb(255,${255*((game.conduct.time%game.conduct.crochet)/game.conduct.crochet)},${255*((game.conduct.time%game.conduct.crochet)/game.conduct.crochet)})`;
    latencySpr.style.width = `${200+(50*(1-((game.conduct.time%game.conduct.crochet)/game.conduct.crochet)))}px`
}

var songName = "";
function loadSong(name) {
    songName = name;
    document.getElementById("song-name").innerHTML = songName;
    let songPath = `./assets/songs/${songName}/`;
    audio.src = songPath+"audio.ogg";
    secAud.src = songPath+"audio-1.ogg";
    loadNotesFromFile(songPath+"chart.json");


    game.conduct.beatTick = () =>{
        tickSound.pause();
        tickSound.currentTime = 0;
        tickSound.play();
    }
}

function loadNotesFromFile(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            chart = data.song;
            console.log("Ready!");
            game.conduct.changeBPM(chart.bpm);

        })
        .catch(error => {
            console.error('There has been a problem with the fetch operation:', error);
        });
}