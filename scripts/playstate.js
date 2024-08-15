/* Frame Update */
let translateX = 0;
let lerpX = 0;
let translateY = 0;
let lerpY = 0;

let zoomLevel = 1;
let zoomLerp = 1;

let scrollSpeed = 1;

function makeNote(time, id, isSustain = false, endPart = false, length = 0) {
    const note = document.createElement("div");
    note.className = "note-scroll";

    const colors = ["purple", "blue", "green", "red"];
    let backgroundImage = `url('./assets/images/notes/${colors[id]}`;
    note.style.backgroundRepeat = "no-repeat";

    if (isSustain) {
        backgroundImage += endPart ? "-end" : "-hold";
        note.style.opacity = "0.7";
        if (endPart) {
            note.style.width = "52px";
            note.style.height = "71px";
            console.log("sused");
        }
    } else {
        note.style.width = "158px";
        note.style.height = "154px";
        note.style.backgroundPosition = "center";
    }

    backgroundImage += `.png')`;

    note.style.backgroundImage = backgroundImage;

    // Calculate the position
    const xpos = 100 + (160 * id) + (isSustain ? (160 / 2) - 26 : 0);
    note.style.left = `${xpos}px`;
    note.style.top = "50px";

    if (isSustain && !endPart && length > 0) {
        let calcHeight = ((length) * (scrollSpeed*0.45));
        console.log(calcHeight);
        note.style.width = "50px";
        note.style.height = `${calcHeight}px`;
        note.style.backgroundRepeat = "repeat-y";
    }

    note.dataset.sustain = isSustain;
    note.dataset.time = time;
    note.dataset.data = id;
    note.dataset.length = length;

    document.getElementById('note-group-opponent').appendChild(note);
}

let notes = [];

// Function to fetch JSON data and create notes
function loadNotesFromFile(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const notesArray = data.song.notes;
            conduct.changeBPM(data.song.bpm);
            scrollSpeed = data.song.speed;
            notesArray.forEach((noteSection) => {
                const sectionNotes = noteSection.sectionNotes;
                
                sectionNotes.forEach(note => {
                    notes.push(note);
                });
            });
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

// Call the function with the path to your JSON file
loadNotesFromFile('./assets/audios/mesmerizer.json'); // Adjust the path as needed

create = () => {
    let i = 0;
    Array.from(document.getElementById("note-strum-opponent").children).forEach(child => {
        let pos = 100+(160) * i;
        child.style.left = `${pos}px`;
        child.style.top = '50px';
        i++;
    });

    let l = 1;
    conduct.beatTick = () => {
        if (conduct.beats % 16 == 0) document.getElementById("bg-video").currentTime = audio.currentTime;
        if (conduct.beats % 4 == 0) {
            zoomLerp *= 1.025;
        }

        //makeNote(conduct.crochet*(conduct.beats+4),l);
        l++;
        if (l > 3) l = 0;
    }
}
var lawawa = new Audio('./assets/audios/hitsound.ogg');
update = () => {
    if (input.keyPressed(" ")) {
        document.getElementById("bg-video").src="./assets/audios/mes.mp4";
        audio.play();
        document.getElementById("start-text").style.display = "none";
    }
    const camWorld = document.getElementById("camWorld");
    const camHUD = document.getElementById("camHUD");
    const camWorldChildren = camWorld.children;

    if (input.keyHeld('ArrowUp')) {
        translateY += 10;
    }
    if (input.keyHeld('ArrowDown')) {
        translateY -= 10;
    }
    if (input.keyHeld('ArrowLeft')) {
        translateX += 10;
    }
    if (input.keyHeld('ArrowRight')) {
        translateX -= 10;
    }

    if (input.keyHeld('q')) {
        zoomLevel *= 0.95;
    }
    if (input.keyHeld('e')) {
        zoomLevel *= 1.05;
    }
    if (input.keyHeld("r")) {
        zoomLevel = 1;
    }

    lerpX = lerp(translateX, lerpX, 0.96);
    lerpY = lerp(translateY, lerpY, 0.96);
    zoomLerp = lerp(zoomLevel, zoomLerp, 0.96);

    Array.from(camWorldChildren).forEach(child => {
        var withFactorX = lerpX * (child.dataset.factorX || 1);
        var withFactorY = lerpY * (child.dataset.factorY || 1);
        var scaling = (child.dataset.scale || 1)
        child.style.transform = `translate(${withFactorX}px, ${withFactorY}px) scale(${scaling})`;
    });
    camWorld.style.transform = `scale(${zoomLerp})`;
    camHUD.style.transform = `scale(${1+((zoomLerp-1)*1.5)})`;

    // Notes //

    if (notes[0]) {
        if (Math.abs(conduct.time - notes[0][0]) < 1500) {
            const [time, id, hold] = notes[0];
            if (hold > 0) {
                makeNote(time, id, true, false,hold);
                makeNote(time+hold, id, true, true,0);
            }
            makeNote(time, id, false, false);
            notes.shift();
        }
    } 

    forEachNotes((obj) => {
        let conv = 50 - (0.45 * (conduct.time - obj.dataset.time) * scrollSpeed);//parseInt(last) + 10;

        obj.style.top = `${conv}px`;
        if (conv < -200) {
            document.getElementById('note-group-opponent').removeChild(obj);
        }
    });

    let l = 0;
    Array.from(document.getElementById("note-strum-opponent").children).forEach(child => {
        if (child.id == "strum-note") {
            let name = "s";
            switch (l) {
                case 0:
                    name = "s";
                    break;
                case 1:
                    name = "d";
                    break;
                case 2:
                    name = "k";
                    break;
                case 3:
                    name = "l";
                    break;
            }
            let sacle = 1;
            if (input.keyHeld(name)) {
                sacle = 1.2;
                forEachNotes((note) => {
                    if (note.dataset.length > 0 && note.dataset.data == l) {
                        if (conduct.time - note.dataset.time > 0
                        ) {
                            let supposedY = (0.45 * (conduct.time - note.dataset.time) * scrollSpeed);//parseInt(last) + 10;
                            let top = 50+(160/2);
                            note.style.top = `${top}px`;
                            let height = note.dataset.length * (scrollSpeed*0.45);
                            note.style.height = `${top + ((top+(height-supposedY)))-height}px`;//`${top-(supposedY-((conduct.time - (note.dataset.time+note.dataset.length)) * (scrollSpeed*0.45)))}px`;
                            //document.getElementById('note-group-opponent').removeChild(note);
                        }
                    }
                });
            }

            if (input.keyPressed(name)) {
                //lawawa.pause();
                //lawawa.currentTime = 0;
                //lawawa.play();
                forEachNotes((note) => {
                    if (conduct.time - note.dataset.time < 200
                        && conduct.time - note.dataset.time > -100
                        && note.dataset.data == l
                        && note.dataset.length == 0
                    ) {
                        document.getElementById('note-group-opponent').removeChild(note);
                    }
                });
            }
            child.style.transform = `scale(${sacle})`;
            child.style.opacity = `${sacle}`;
            l++;
        }
    });
}

function forEachNotes(callback) {
    var elements = document.getElementsByClassName('note-scroll');

    for (var i = 0, length = elements.length; i < length; i++) {
        try {
            callback(elements[i]);
        } catch (error) {
            
        }
    }
}