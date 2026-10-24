import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {PhysicalEngine} from './physical-engine.js';
let writes=0,nodes=0,now=0;
function param(){let value=0;const set=v=>{assert.ok(Number.isFinite(v));value=v;writes++;};return {get value(){return value;},set value(v){set(v);},setTargetAtTime(v,t,tc){assert.ok(tc>0&&Number.isFinite(t));set(v);},setValueAtTime(v,t){set(v);},linearRampToValueAtTime(v,t){set(v);},exponentialRampToValueAtTime(v,t){assert.ok(v>0);set(v);},cancelScheduledValues(){}};}
function node(){nodes++;const n={connect(){},disconnect(){},start(){},stop(){},setPeriodicWave(){}};for(const k of ['gain','frequency','detune','Q','delayTime','threshold','knee','ratio','attack','release','pan'])n[k]=param();return n;}
const ctx={sampleRate:48000,get currentTime(){return now;},state:'running',resume:async()=>{},destination:node(),audioWorklet:{addModule:async()=>{}},createBuffer(ch,length,sr){const arrays=Array.from({length:ch},()=>new Float32Array(length));return {duration:length/sr,getChannelData:i=>arrays[i]};},createPeriodicWave:()=>({})};
for(const name of ['Gain','Oscillator','BiquadFilter','Delay','WaveShaper','DynamicsCompressor','BufferSource','ScriptProcessor'])ctx['create'+name]=node;
globalThis.AudioWorkletNode=class{constructor(){const n=node();n.port={postMessage(){}};n.parameters=new Map(['f0','load','amp','rough','ripple','low'].map(k=>[k,param()]));return n;}};
const rig=new PhysicalEngine(ctx,ctx.destination);await rig.load();
for(const [engine,idle,red] of [['v8',750,6500],['v12',800,8500],['f6',850,8400]]){
 rig.select(engine);const before=nodes;
 for(let i=0;i<240;i++){rig.update({engine,rpm:idle+(red-idle)*i/240,thr:i<120?.7:0,shiftTime:i%60<10?.2:0,shiftDirection:-1,revBlip:i%60<18?.3-(i%60)/60:0},{idle,red});now+=1/60;}
 assert.equal(nodes,before,'no per-frame audio nodes');rig.pop(.5,.22);rig.mute();assert.equal(rig.current.gain.gain.value,0);
}
rig.disposeGraph();await new Promise(r=>setTimeout(r,100));
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8'),elements={vol:{value:.6},audioStatus:{textContent:''}};
const scope={window:{AudioContext:function(){return ctx;}},document:{getElementById:id=>elements[id]},console,Float32Array};vm.createContext(scope);
const prefix=html.slice(html.indexOf('const ENGINES='),html.indexOf('function demoInput'));
vm.runInContext(prefix+';PhysicalAudio.prototype.load=async function(){};initAudio();if(!sampleRig)throw Error("audio adapter not reached");S.running=true;for(const id of ["v8","v12","f6","elec"]){S.engine=id;S.rpm=2000;applyEngine();updateAudio();}',scope);
assert.ok(writes>10000);console.log('Full audio boot, fallback, three physical profiles, downshift blip and mute PASS');
