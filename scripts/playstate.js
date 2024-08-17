/* Camera Position and Movement */
let translateX = 0;
let lerpX = 0;
let translateY = 0;
let lerpY = 0;

/* camWorld - Zoom Scale */
let zoomLevel = 1;
let zoomLerp = 1;

/* camHUD - HUD Zoom Scale */
let hudZoomLevel = 1;
let hudZoomLerp = 1;

/* Song Speed and Game Related Stuffs */
let scrollSpeed = 1;
let canStart = false;
let usingBotplay = false;
var mobilepress = false;

/* Audio and Notes */
let audioDuration = 0;
let notes = [];

/* Mobile Input */
var mobTouch = [];
var mobTap = [];

/* Score Text things */
var score = 0;
var accuracy = 0;
var misses = 0;

var notesTotal = 0;
var hitNoteTotal = 0;

/* Create Function */
create = () => {
    const setChildPos = (parentId, middleMultiplier, offsetMultiplier, topPosition) => {
        const parent = document.getElementById(parentId);
        const middle = window.innerWidth * middleMultiplier;
        let l = 0;
        Array.from(parent.children).forEach((child) => {
            if (child.id != "strum-note") return;
            let pos = middle + (160 * l * offsetMultiplier);
            child.style.left = `${pos - 50}px`;
            child.style.top = `${topPosition}px`;
            l++;
        });
    };

    setChildPos("note-strum-opponent", 0.1, 1, 50);
    setChildPos("note-strum-player", 0.9, 1, 50);

    const touchGroup = document.getElementById("touch-group");
    const touchSize = window.innerWidth * 0.25;
    Array.from(touchGroup.children).forEach((touch, i) => {
        touch.style.width = `${touchSize}px`;
        touch.style.height = `${window.innerHeight}px`;
        touch.dataset.id = i;
        touch.style.left = `${touchSize * i}px`;
        touch.onclick = () => {
            mobTouch[i] = true;
            mobTap[i] = true;
        };
    });

    let l = 1;
    conduct.beatTick = () => {
        if (conduct.beats % 4 === 0) {
            zoomLerp *= 1.025;
            hudZoomLerp *= 1.055;
        }
        l = (l + 1) % 4;
    };

    document.getElementById("camOther").onclick = () => {
        mobilepress = true;
        console.log("hi");
    };

    loadNotesFromFile('./assets/audios/cocoa-erect.json');
};

/* Update Function */
update = () => {
    if (canStart) {
        if (isMobile() ? mobilepress : input.keyPressed(" ")) {
            document.getElementById("camOther").onclick = () => { };
            mobilepress = false;
            //document.getElementById("bg-video").src = "./assets/audios/mes.mp4";

            secAud.play();
            audio.play();
            document.getElementById("start-text").style.display = "none";
        }
    }

    _updateRatingGroup();
    _updateCameraAndHUD();
    _noteHandler();
}

function _updateRatingGroup() {
    Array.from(document.getElementById("rating-group").children, (rating)=>{
        let curY = parseFloat(rating.style.top.substring(0,rating.style.top.length - 2));
        curY += parseFloat(rating.dataset.accY);
        rating.style.top = `${curY}px`;
        rating.dataset.accY = parseFloat(rating.dataset.accY) + 0.5;
        let alpha = 1;
        if (curY > window.innerHeight/2) {
            alpha = 1-((curY-window.innerHeight/2) / ((window.innerHeight/2)-200));
            if (alpha < 0) {
                document.getElementById("rating-group").removeChild(rating);
            }
        }
        rating.style.opacity = `${alpha}`;
    });
} 
function _updateCameraAndHUD() {
    const camWorld = document.getElementById("camWorld");
    const camHUD = document.getElementById("camHUD");

    // World camera movement.
    if (input.keyHeld('ArrowUp')) translateY += 10;
    if (input.keyHeld('ArrowDown')) translateY -= 10;
    if (input.keyHeld('ArrowLeft')) translateX += 10;
    if (input.keyHeld('ArrowRight')) translateX -= 10;

    // World camera zoom handling.
    if (input.keyHeld('q')) zoomLevel *= 0.95;
    if (input.keyHeld('e')) zoomLevel *= 1.05;
    if (input.keyHeld("r")) zoomLevel = 1;

    // Lerping cuz' they look smooth
    lerpX = lerp(translateX, lerpX, 0.96);
    lerpY = lerp(translateY, lerpY, 0.96);
    zoomLerp = lerp(zoomLevel, zoomLerp, 0.92);
    hudZoomLerp = lerp(hudZoomLevel, hudZoomLerp, 0.92);

    // Important for camera movement in world camera
    Array.from(camWorld.children).forEach(child => {
        const withFactorX = lerpX * (child.dataset.factorX || 1);
        const withFactorY = lerpY * (child.dataset.factorY || 1);
        const scaling = (child.dataset.scale || 1);
        child.style.transform = `translate(${withFactorX}px, ${withFactorY}px) scale(${scaling})`;
    });

    // Apply transforms to world and HUD camera.
    camWorld.style.transform = `scale(${zoomLerp})`;
    camHUD.style.transform = `scale(${hudZoomLerp})`;

    // Timer.
    document.getElementById('latency-text').innerHTML = audio.paused ? 'Cocoa [FNF\': Animania!]' : `${getCurrentDuration(conduct.time)} / ${getCurrentDuration(audio.duration * 1000)}`;
    document.getElementById("info-text").innerHTML = `Misses: ${misses} // Score: ${score} // Accuracy: ${(accuracy*100).toFixed(1)}%`;
}

function _noteHandler() {
    // Notes Spawning //
    while (notes[0] && Math.abs(conduct.time - notes[0][0]) < 1500) {
        const [time, noteId, hold] = notes[0].map(Number);
        const id = noteId % 4;
        const curPlayer = noteId > 3;

        if (hold > 0) {
            makeNote(time, id, curPlayer, true, false, hold);
            makeNote(time + hold, id, curPlayer, true, true, 0);
        }
        makeNote(time, id, curPlayer, false, false);
        notes.shift();
    }

    // Notes Positioning //
    forEachNotes((note) => {
        const topPosition = 50 - (0.45 * (conduct.time - note.dataset.time) * scrollSpeed);
        note.style.top = `${topPosition}px`;

        if (topPosition < -2000) {
            const pref = note.dataset.sustain === "true" ? "-sustain" : "";
            const group = note.dataset.isplayer === "true" ? 'note-group-player' + pref : 'note-group-opponent' + pref;
            document.getElementById(group).removeChild(note);
        }
    });

    // And the worst part, Player inputs and simulating note presses in opponent's side. //
    const strumPlayer = document.getElementById("note-strum-player");
    const children = Array.from(strumPlayer.children);

    const noteImages = {
        left: './assets/images/notes/staticleft.png',
        down: './assets/images/notes/staticdown.png',
        up: './assets/images/notes/staticup.png',
        right: './assets/images/notes/staticright.png',
        confirmleft: './assets/images/notes/staticleft-confirm.png',
        confirmdown: './assets/images/notes/staticdown-confirm.png',
        confirmup: './assets/images/notes/staticup-confirm.png',
        confirmright: './assets/images/notes/staticright-confirm.png'
    };

    const keyBindings = [
        { key: 's', anim: 'left' },
        { key: 'd', anim: 'down' },
        { key: 'k', anim: 'up' },
        { key: 'l', anim: 'right' }
    ];

    const handleNoteAction = (child, index, name, anim, curString) => {
        const held = isMobile() ? mobTouch[index] : input.keyHeld(name);
        const pressed = isMobile() ? mobTap[index] : input.keyPressed(name);
        const released = input.keyReleased(name);

        if (released) {
            curString = noteImages[anim];
        }

        if (held) {
            forEachNotes(note => {
                if (note.className !== "note-scroll-player") return;
                if (note.dataset.end === 'false' && conduct.time > note.dataset.time && note.dataset.data === `${index}`) {
                    const length = parseFloat(note.dataset.length);
                    if (length > 0) {
                        const supposedY = 0.45 * (conduct.time - note.dataset.time) * scrollSpeed;
                        note.style.top = `${50 + (160 / 2)}px`;
                        note.style.height = `${length * scrollSpeed * 0.45 - (supposedY + (supposedY < 50 + (160 / 2) ? 0 : 80))}px`;
                    }
                } else if (note.dataset.time < conduct.time + 100 && note.dataset.data === `${index}` && note.dataset.sustain === 'true') {
                    const pref = note.dataset.sustain === "true" ? "-sustain" : "";
                    document.getElementById('note-group-player' + pref).removeChild(note);
                }
            });
        }

        if (pressed) {
            let possibleNotes = [];
            let directions = [false, false, false, false];
            
            forEachNotes(note => {
                if (note.className !== "note-scroll-player") return;
                if (note.dataset.sustain === "true") return;
                
                let noteData = parseInt(note.dataset.data);
                let time = parseFloat(note.dataset.time);
                
                if ((conduct.time - time > -250 && conduct.time - time < 300)) {
                    if (directions[noteData]) {
                        for (let i = 0; i < possibleNotes.length; i++) {
                            let pNote = possibleNotes[i];
                            let pNData = parseInt(pNote.dataset.data);
                            let pNTime = parseFloat(pNote.dataset.time);
                            
                            if (pNData !== noteData) continue;
                            
                            if (Math.abs(note.strumTime - pNTime) < 10) {
                                const pref = note.dataset.sustain === "true" ? "-sustain" : "";
                                document.getElementById('note-group-player' + pref).removeChild(note);
                                return;
                            } else if (time < pNTime) {
                                possibleNotes.splice(i, 1);
                                possibleNotes.push(note);
                                return;
                            }
                        }
                    } else {
                        possibleNotes.push(note);
                        directions[noteData] = true;
                    }
                }
            });
            
            
            possibleNotes.sort((a, b) => (parseFloat(a.dataset.time) - parseFloat(b.dataset.time)));

            let pressArray = [
                input.keyPressed("s"),
                input.keyPressed("d"),
                input.keyPressed("k"),
                input.keyPressed("l"),
            ]
            
            let blockNote = false;

            for (let i = 0; i < pressArray.length; i++) 
                if (pressArray[i] && !directions[i]) blockNote = true;

            if (possibleNotes.length > 0 && !blockNote) {
                for (let i = 0; i < possibleNotes.length; i++) {
                    let note = possibleNotes[i];
                    if (pressArray[parseInt(note.dataset.data)]) {
                        ratingPopUp(Math.abs(conduct.time - note.dataset.time));
                        const pref = note.dataset.sustain === "true" ? "-sustain" : "";
                        document.getElementById('note-group-player' + pref).removeChild(note);
                        curString = noteImages["confirm"+anim];
                        notesTotal++;
                    }
                }
            }
        }

        return curString;
    };

    if (!usingBotplay) {
        let index = 0;
        children.forEach((child) => {
            if (child.id === "strum-note") {
                const { key, anim } = keyBindings[index] || { key: '', anim: '' };
                let curString = child.src;

                curString = handleNoteAction(child, index, key, anim, curString);

                mobTouch = [false, false, false, false];

                if (child.src !== curString) {
                    child.src = curString;
                    const offset = curString.includes('confirm') ? -44 : 0;
                    child.style.transform = `translate(${offset}px, ${offset}px)`;
                }
                index++;
            }
        });

        forEachNotes(note => {
            if (note.className !== "note-scroll-player") {
                const noteTime = parseFloat(note.dataset.time);
                const noteLength = parseFloat(note.dataset.length);
                const top = 50 + (160 / 2);
                const supposedY = 0.45 * (conduct.time - noteTime) * scrollSpeed;

                if (note.dataset.end === 'false') {
                    if (noteLength === 0 && conduct.time > noteTime) {
                        document.getElementById('note-group-opponent').removeChild(note);
                    } else if (noteLength > 0 && conduct.time > noteTime) {
                        note.style.top = `${top}px`;
                        note.style.height = `${noteLength * scrollSpeed * 0.45 - (supposedY + 80)}px`;
                    }
                } else if (note.dataset.end === 'true') {
                    const pref = note.dataset.sustain === "true" ? "-sustain" : "";
                    document.getElementById('note-group-player' + pref).removeChild(note);
                }
            }
        });
    } else {
        forEachNotes(note => {
            if (conduct.time > parseFloat(note.dataset.time)) {
                const pref = note.dataset.sustain === "true" ? "-sustain" : "";
                document.getElementById('latency-text').innerHTML = `${Math.abs(conduct.time - parseFloat(note.dataset.time)).toFixed(2)}ms`;
                document.getElementById('note-group-player' + pref).removeChild(note);
            }
        });
    }
}



/* Internals */
function forEachNotes(callback) {
    const elements = [...document.getElementsByClassName('note-scroll-player'), 
                      ...document.getElementsByClassName('note-scroll')];

    elements.forEach(element => {
        try {
            callback(element);
        } catch (error) {
            // Handle the error if necessary
        }
    });
}

function getCurrentDuration(musicTime)
{
    let theshit = Math.floor(musicTime / 1000);
    let secs = '' + theshit % 60;
    let mins = "" + Math.floor(theshit / 60)%60;
    let hour = '' + Math.floor((theshit / 3600))%24; 
    if (theshit < 0)
        theshit = 0;
    if (musicTime < 0)
        musicTime = 0;

    if (secs.length < 2)
        secs = '0' + secs;

    let shit = mins + ":" + secs;
    if (hour != "0"){
        if (mins.length < 2) mins = "0"+ mins;
        shit = hour+":"+mins + ":" + secs;
    }
    return shit;
}

/* Creates a new note. */
function makeNote(time, id, player = false, isSustain = false, endPart = false, length = 0) {
    const note = document.createElement("div");
    note.className = `note-scroll${player ? "-player" : ""}`;
    
    const colors = ["purple", "blue", "green", "red"];
    const noteType = isSustain ? (endPart ? "-end" : "-hold") : "";
    note.style.backgroundImage = `url('./assets/images/notes/${colors[id]}${noteType}.png')`;
    note.style.backgroundRepeat = isSustain && !endPart ? "repeat-y" : "no-repeat";
    note.style.opacity = isSustain ? "0.7" : "1";
    
    note.style.width = isSustain && endPart ? "52px" : isSustain ? "50px" : "158px";
    note.style.height = isSustain && endPart ? "71px" : isSustain ? `${length * scrollSpeed * 0.45}px` : "154px";
    
    const middle = window.innerWidth * (player ? 0.9 : 0.1);
    note.style.left = `${middle + 160 * id + (isSustain ? 54 : 0) - 50}px`;
    note.style.top = "50px";
    
    Object.assign(note.dataset, { sustain: isSustain, time, data: id, length, end: endPart, isplayer: player });
    
    document.getElementById(player ? 'note-group-player' + (isSustain ? "-sustain" : "") : 'note-group-opponent' + (isSustain ? "-sustain" : "")).appendChild(note);
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
            const notesArray = data.song.notes;
            conduct.changeBPM(data.song.bpm);
            scrollSpeed = data.song.speed;
            notesArray.forEach((noteSection) => {
                const sectionNotes = noteSection.sectionNotes;

                sectionNotes.forEach(note => {
                    if (noteSection.mustHitSection) {
                        note[1] = (note[1] + 4) % 8;
                    }
                    notes.push(note);
                });
            });
            canStart = true;
            console.log("Ready!");
            console.log(notes.length);
            notes.sort((a, b) => a[0] - b[0]);
        })
        .catch(error => {
            console.error('There has been a problem with the fetch operation:', error);
        });
}

function ratingPopUp(diff) {
    const windowSize = [
        { time: 300, rating: "shit" },
        { time: 200, rating: "bad" },
        { time: 150, rating: "good" },
        { time: 80, rating: "sick" },
    ];

    let ratingText = "shit";
    for (let i = 0; i < windowSize.length; i++) {
        if (diff <= windowSize[i].time) {
            ratingText = windowSize[i].rating;
        } else {
            break;
        }
    }

    switch (ratingText) {
        case "shit": hitNoteTotal+= 0.125; score+=50; break;
        case "bad": hitNoteTotal+= 0.25; score+=100;break;
        case "good": hitNoteTotal+= 0.50; score+=200;break;
        case "sick": hitNoteTotal+= 1; score+=400;break;
    }

    accuracy = hitNoteTotal / notesTotal;

    const rating = document.createElement("img");
    rating.src = `./assets/images/ui/${ratingText}.png`;
    rating.id = "rating-sprite";
    rating.style.left = `${window.innerWidth * 0.35}px`;
    rating.style.top = `${window.innerHeight * 0.45}px`;
    rating.dataset.accY = -10;
    rating.dataset.accX = Math.random()*10;
    document.getElementById("rating-group").appendChild(rating);
}
