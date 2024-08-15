/**
 * A STUPIDLY WRITTEN CODE BY CORECAT
 * I don't know how to code in js so eh.
 * **/
HARD_INIT_ALL();

/* Game */
const _FPS = 120;
const input = new Input();
const conduct = new Conductor();

var audio = new Audio('./assets/audios/Inst.ogg');
audio.play();
//var secAud = new Audio('./assets/audios/Voices.ogg');
//secAud.play();

//audio.playbackRate = secAud.playbackRate = 0.5;

/* Override these funcs */
var create = ()=>{}
var update = ()=>{}

function innerUpdate() {
    updateFPS();
    update(); // Updating current state.

    conduct.time = audio.currentTime*1000;
    conduct.update();
    input.update();


    setTimeout(innerUpdate, (1 / (_FPS + 5)) * 1000);
}

/* FPS Counter */
const times = [];
var updateFPS = ()=> {
    times.push(Date.now() / 1000);

    while (times.length > 0 && (Date.now() / 1000) - times[0] > 1) {
        times.shift();
    }
    let strMem = 'Memory API is not supported in this browser.';
    if (performance.memory) {
        const memory = performance.memory;
        const usedJSHeap = memory.usedJSHeapSize / (1024 * 1024);
        const totalJSHeap = memory.totalJSHeapSize / (1024 * 1024);
        const jsHeapLimit = memory.jsHeapSizeLimit / (1024 * 1024);

        strMem = `
            Used JS Heap: ${usedJSHeap.toFixed(2)} MB<br>
            Total JS Heap: ${totalJSHeap.toFixed(2)} MB<br>
            JS Heap Limit: ${jsHeapLimit.toFixed(2)} MB
        `;
    }
    document.getElementById("fps-text").innerHTML = "FPS: " + times.length+"<br>"+strMem+"<br>HTML Engine";
}

/* Important */
document.addEventListener("DOMContentLoaded", (event) => {
    console.log("Ready");
    create();
    innerUpdate();
});

/* Misc */
function lerp(start, end, t) {
    return start + (end - start) * t;
}


function HARD_INIT_ALL() {
    // INPUT CLASS
    class Input {
        constructor() {
            // Variable Init //
            this.heldKeys = new Set();
            this.pressedKeys = new Set(); // Only fires once
            this.releasedKeys = new Set(); // This one also fires once

            // Initialize // 
            document.addEventListener('keydown', (event) => {
                this.heldKeys.add(event.key);
                this.pressedKeys.add(event.key);
                this.releasedKeys.add(event.key);
            });
            
            document.addEventListener('keyup', (event) => {
                this.heldKeys.delete(event.key);
            });

            console.log("Input Initialized.");
        }

        update() {
            this.pressedKeys.clear();
        }

        keyHeld(key) {
            return this.heldKeys.has(key);
        }

        keyPressed(key) {
            return this.pressedKeys.has(key);
        }

        keyReleased(key) {
            if (!isKeyPressed(key) && releasedKeys.has(key)) {
                this.releasedKeys.delete(key);
                return true;
            } else {
                return false;
            }
        }
    }
    window.Input = Input;

    class Conductor {
        constructor() {
            this.bpm = 120;
            this.crochet = ((60 / this.bpm) * 1000);
            this.stepCrochet = this.crochet / 4;
            this.beats = 0;
            this.steps = 0;
            this.time = 0;

            this.oldBeats = 0;
            this.oldSteps = 0;

            this.beatTick = () => {

            }

            this.stepTick = () => {

            }
        }

        update() {
            this.beats = Math.floor(this.time / this.crochet);
            this.steps = Math.floor(this.time / this.stepCrochet);

            if (this.oldSteps != this.steps) {
                this.stepTick();
                this.oldSteps = this.steps;
            }
            if (this.oldBeats != this.beats) {
                this.beatTick();
                this.oldBeats = this.beats;
            }
        }

        changeBPM(newBPM) {
            this.bpm = newBPM;
            this.crochet = ((60 / this.bpm) * 1000);
            this.stepCrochet = this.crochet / 4;
        }
    }
    window.Conductor = Conductor;
}