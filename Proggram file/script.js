const WAVE_THRESH = 3;
const CHAR_MULT = 3;
const ANIM_STEP = 40;
const WAVE_BUF = 5;

export const createASCIIShift = (el, opts = {}) => {

let origTxt = el.textContent;
let origChars = origTxt.split("");
let isAnim = false;
let cursorPos = 0;
let waves = [];

const cfg = {
dur:600,
chars:'.,-~+=*#@0123456789',
spread:0.3,
...opts
};

const updateCursorPos = (e)=>{
const rect = el.getBoundingClientRect();
const x = e.clientX - rect.left;
const len = origTxt.length;

const pos = Math.round((x / rect.width) * len);
cursorPos = Math.max(0, Math.min(pos, len - 1));
};

const startWave = ()=>{
waves.push({
startPos:cursorPos,
startTime:Date.now()
});

if(!isAnim) start();
};

const cleanupWaves = (t)=>{
waves = waves.filter(w => t - w.startTime < cfg.dur);
};

const calcWaveEffect = (charIdx, t)=>{

let resultChar = origChars[charIdx];
let shouldAnim = false;

for(const w of waves){

const age = t - w.startTime;
const prog = Math.min(age / cfg.dur,1);
const dist = Math.abs(charIdx - w.startPos);

const maxDist = Math.max(w.startPos, origChars.length - w.startPos - 1);
const rad = (prog * (maxDist + WAVE_BUF)) / cfg.spread;

if(dist <= rad){

shouldAnim = true;

const intens = Math.max(0, rad - dist);

if(intens <= WAVE_THRESH && intens > 0){

const charIndex =
(dist * CHAR_MULT + Math.floor(age / ANIM_STEP)) % cfg.chars.length;

resultChar = cfg.chars[charIndex];
}

}

}

return {shouldAnim,char:resultChar};

};

const genScrambledTxt = (t)=>{

return origChars.map((char,i)=>{

const res = calcWaveEffect(i,t);
return res.shouldAnim ? res.char : char;

}).join("");

};

const start = ()=>{

isAnim = true;
el.classList.add("as");

const animate = ()=>{

const t = Date.now();

cleanupWaves(t);

if(waves.length === 0){
stop();
return;
}

el.textContent = genScrambledTxt(t);

requestAnimationFrame(animate);

};

requestAnimationFrame(animate);

};

const stop = ()=>{

el.textContent = origTxt;
el.classList.remove("as");
isAnim = false;

};

el.addEventListener("mouseenter",e=>{
updateCursorPos(e);
startWave();
});

el.addEventListener("mousemove",e=>{
updateCursorPos(e);
startWave();
});

};

const initASCIIShift = ()=>{

const links = document.querySelectorAll("a");

links.forEach(link=>{
if(!link.textContent.trim()) return;

createASCIIShift(link,{
dur:1000,
spread:1
});

});

};

initASCIIShift();