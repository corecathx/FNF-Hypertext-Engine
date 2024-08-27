/**
 * A STUPIDLY WRITTEN CODE BY CORECAT
 * I don't know how to code in js so eh.
 * **/
HARD_INIT_ALL();

const game = {
    info: {
        fps: 240,
    },
    elapsed: 0,
    input: new Input(),
    conduct: new Conductor()
}

const isMobile = () => {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

/* Game */
const trace = (data) =>{console.log(data)}

var audio = new Audio('./assets/audios/Inst.ogg');
var secAud = new Audio('./assets/audios/Voices.ogg');

audio.preservesPitch = secAud.preservesPitch = false;
//audio.playbackRate = secAud.playbackRate = 0.5;

/* Override these funcs */
var create = ()=>{}
var update = ()=>{}

function innerUpdate() {
    updateFPS();
    update(); // Updating current state.

    game.conduct.time = audio.currentTime*1000;
    game.conduct.update();
    game.input.update();

    game.elapsed = 1/times.length;

    setTimeout(()=>{
        innerUpdate();
        //requestAnimationFrame(innerUpdate)
    }, (1 / (game.info.fps + 5)) * 1000);
}

/* FPS Counter */
var showingInfos = false;
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
            ${usedJSHeap.toFixed(2)} MB / <span style="font-size:12px; color:gray;">${totalJSHeap.toFixed(2)} MB</span>
        `;
    }

    if (game.input.keyPressed("2")) {
        showingInfos = !showingInfos;
    }

    if (game.input.keyHeld("6")) {
        game.info.fps -= 1;
    }

    if (game.input.keyHeld("7")) {
        game.info.fps += 1;
    }
    
    let additionalInfo = !showingInfos ? "" : `
        Browser: ${navigator.appName}<br>
        Screen Resolution: ${screen.width}x${screen.height}<br>
        Objects Count: ${document.body.getElementsByTagName("*").length}<br>
        Game: ${game}
    `;

    let SPF = `<span style="font-size:12px; color:gray;">(${((1/times.length).toPrecision(1))*1000}ms)</span>`;
    document.getElementById("fps-text").innerHTML = `
        <span style="font-size:22px;">${times.length}</span> FPS ${SPF}<br>
        ${strMem}<br>
        HyperText Engine<br><br>
        ${additionalInfo}
    `;
}

/* Important */
document.addEventListener("DOMContentLoaded", (event) => {
    console.log("Ready");
    if (isMobile()){
        alert("Mobile Client detected, expect some stuff not working properly.");
        document.getElementById("start-text").innerHTML = "[[Press your screen to start.]]";
    }
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
            if (!this.keyHeld(key) && this.releasedKeys.has(key)) {
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

    class Character {
        constructor(x, y, name) {
            this.x = x;
            this.y = y;
            this.name = name;
            this.object = document.createElement("img");
            this.object.style.left = `${this.x}px`;
            this.object.style.top = `${this.y}px`;

            this.curAnim = "";
            this.frames = {};
            this.holdTime = 0;

            try {
                fetch("./assets/data/chars/" + this.name + "/config.json")
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    this.jsData = data;
                    this.processFrames(this.jsData.frames);
                    this.playAnim("idle",true);
                })
                .catch(error => {
                    console.error('There has been a problem with the fetch operation:', error);
                });
            } catch (error) {
                console.error('Error initializing character:', error);
            }
        }
    
        processFrames(frames) {
            for (const [key, frameData] of Object.entries(frames)) {
                this.frames[key] = {
                    offset: frameData.offset,
                    name: frameData.name
                };
            }
        }
    
        playAnim(name, forced = false) {
            if (!this.frames[name]) {
                console.error(`Animation '${name}' does not exist.`);
                return;
            }

            this.curAnim = name;
            const frame = this.frames[this.curAnim];
            let newSrc = `./assets/data/chars/${this.name}/${frame.name}.gif`;

            if (this.object.src === newSrc) this.object.src = "";
            this.object.style.left = `${this.x + frame.offset[0]}px`;
            this.object.style.top = `${this.y + frame.offset[1]}px`;
            this.object.src = newSrc;
            this.holdTime = 0;
        }
        
        dance() {
            if (this.curAnim.startsWith("sing")) return;
            this.playAnim("idle",true);
        }

        update() {
            if (this.curAnim.startsWith("sing")){
                this.holdTime += game.elapsed;
                if (this.holdTime > (game.conduct.crochet*2)/1000) {
                    this.playAnim("idle",true);
                    this.holdTime = 0;
                }
            }

        }
    }
    
    window.Character = Character;
}