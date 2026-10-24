const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
let now=10000,epoch=1800000000000,watchCalls=0,cleared=[],callbacks=[];
const elements=new Map(),el=id=>{if(!elements.has(id))elements.set(id,{textContent:'',hidden:false,checked:true,classList:{toggle(){},add(){},remove(){}}});return elements.get(id);};
const pops=[];const scope={console,Math,Date:{now:()=>epoch+now},performance:{now:()=>now},window:{isSecureContext:true},document:{getElementById:el},navigator:{geolocation:{watchPosition:(ok,error)=>{callbacks.push({ok,error});return ++watchCalls;},clearWatch:id=>cleared.push(id)}},pop:(strength,delay=0)=>pops.push({strength,delay}),stopDemo(){scope.t.S.demo=false;el('btnDemo').textContent='▶ Demo';}};
vm.createContext(scope);
const state=html.slice(html.indexOf('const ENGINES='),html.indexOf('function makePulseProc'));
const driving=html.slice(html.indexOf('const clamp='),html.indexOf('function render(){'));
const gps=html.slice(html.indexOf('function hav('),html.indexOf('let wakeLock='));
const mode=html.slice(html.indexOf('function setMode(m)'),html.indexOf("$('retryGps').onclick"));
vm.runInContext(state+driving+gps+mode+';globalThis.t={S,ENGINES,step,updateTransmission,updateExhaust,receiveGps,refreshGps,startGps,stopGps,setMode,resetShiftMemory};',scope);
const t=scope.t,S=t.S,initial={...S};function reset(){Object.assign(S,initial);t.resetShiftMemory();S.running=true;pops.length=0;}
// User's exact regression: lift in third at high rpm; no coast upshifts, even after the brief hold expires.
for(const id of ['v8','v12','f6']){
 reset();const e=t.ENGINES[id];Object.assign(S,{engine:id,gear:3,v:e.gears[2]*.8,rpm:e.red*.8,thr:0,driveIntent:0,demand:.9,aggression:.9,accel:-.5});
 for(let i=0;i<1200;i++){S.v-=.005;t.updateTransmission(S,e,1/60);assert.equal(S.gear,3);assert.ok(S.rpm<=e.red*1.015);}
 const changes=[];for(let i=0;i<2400&&S.v>5;i++){S.v-=.05;S.brk=.5;S.accel=-3;const before=S.gear,fromRPM=S.v/e.gears[before-1]*e.red;t.updateTransmission(S,e,1/60);if(S.gear!==before){assert.equal(S.gear,before-1);assert.ok(fromRPM>e.idle*1.65);changes.push({from:before,to:S.gear,rpm:Math.round(fromRPM)});}}
 assert.ok(changes.length>=2);console.log(id,'coast hold + sequential early reductions PASS',changes);
}
// No gear hunting when cruising or after an early low-throttle upshift.
reset();Object.assign(S,{gear:4,v:80,rpm:3000,thr:.2,driveIntent:.2,demand:.2,accel:0});for(let i=0;i<1800;i++){S.v=80+Math.sin(i*.1)*.2;t.updateTransmission(S,t.ENGINES.v8,1/60);assert.equal(S.gear,4);}
// Integrated test: early input lift must prevent an upshift before the smoothed throttle decays.
reset();Object.assign(S,{gear:3,v:110,rpm:5300,thr:1,lastThrottle:1,demand:1,aggression:1,inThr:0,mode:'test'});for(let i=0;i<180;i++){t.step(1/60);assert.equal(S.gear,3);}assert.ok(pops.length>=3);const afterBurst=pops.length;for(let i=0;i<180;i++)t.step(1/60);assert.equal(pops.length,afterBurst,'no endless coast crackle');
// Downshift: event fires paired crackles and audible rev-match request.
reset();Object.assign(S,{gear:3,v:42,rpm:2100,thr:0,lastThrottle:0,inThr:0,mode:'test',gearHold:0});t.step(1/60);assert.equal(S.gear,2);assert.ok(S.revBlip>0);assert.ok(pops.some(x=>x.delay===.22));
// GPS mode selection cancels demo and starts the watch even with engine off.
reset();S.running=false;S.demo=true;t.setMode('gps');assert.equal(S.demo,false);assert.equal(watchCalls,1);assert.equal(S.mode,'gps');t.startGps();assert.equal(watchCalls,1,'idempotent watch');
const position=(speed,latitude=40,accuracy=5)=>({timestamp:epoch+now,coords:{latitude,longitude:-3,speed,accuracy}});
callbacks.at(-1).ok(position(20));assert.equal(S.gpsSpeed,72);assert.ok(S.gpsOk);
now+=6000;t.refreshGps();assert.ok(S.gpsOk,'six second updates remain usable');now+=7000;t.refreshGps();assert.equal(S.gpsOk,false);assert.match(el('tGps').textContent,/sin datos/);
// Retry isolates callbacks from the superseded watcher.
const old=callbacks.at(-1);t.startGps(true);assert.equal(watchCalls,2);old.ok(position(30));assert.equal(S.gpsOk,false);callbacks.at(-1).ok(position(15));assert.equal(S.gpsSpeed,54);
callbacks.at(-1).error({code:1});assert.equal(S.gpsOk,false);assert.match(el('tGps').textContent,/bloqueada/);
t.startGps(true);callbacks.at(-1).ok(position(null,40));assert.equal(S.gpsOk,false);now+=1000;callbacks.at(-1).ok(position(null,40.00018));assert.ok(S.gpsSpeed>60&&S.gpsSpeed<80);assert.match(el('gpsDetail').textContent,/estimada/);
// In-car browsers (Tesla): timestamps offset from the device clock must NOT block GPS (v0.7.0 regression).
t.startGps(true);const skewed=(speed,lat=40)=>({timestamp:epoch+now-3600000,coords:{latitude:lat,longitude:-3,speed,accuracy:5}});
callbacks.at(-1).ok(skewed(20));assert.ok(S.gpsOk,'fix with one-hour clock offset accepted');assert.equal(S.gpsSpeed,72);
now+=1000;callbacks.at(-1).ok(skewed(25));assert.equal(S.gpsSpeed,90);
// ...but a cached fix far older than the learned baseline is still rejected.
now+=1000;callbacks.at(-1).ok({...skewed(10),timestamp:epoch+now-3600000-60000});assert.equal(S.gpsSpeed,90,'cached stale fix ignored');
// Some devices report speed=0 while positions move: require consecutive evidence before overriding zero.
t.startGps(true);callbacks.at(-1).ok(position(0,40));now+=1000;callbacks.at(-1).ok(position(0,40.00018));assert.equal(S.gpsSpeed,0);now+=1000;callbacks.at(-1).ok(position(0,40.00036));assert.ok(S.gpsSpeed>60);
const speedBefore=S.gpsSpeed;callbacks.at(-1).ok({...position(80),timestamp:epoch+now-1000});assert.equal(S.gpsSpeed,speedBefore,'ignore reordered fix');
// Poor stationary locations must not manufacture motion.
t.startGps(true);callbacks.at(-1).ok(position(null,40,500));now+=1000;callbacks.at(-1).ok(position(null,40.0004,500));assert.equal(S.gpsOk,false);
// GPS readings feed the driving model, not the test pedals.
t.startGps(true);callbacks.at(-1).ok(position(20,40));S.running=true;S.demo=false;for(let i=0;i<180;i++)t.step(1/60);assert.ok(Math.abs(S.v-72)<.1);
t.setMode('test');assert.equal(S.watchId,null);assert.equal(el('gpsDetail').hidden,true);
console.log('Driving, exhaust events, GPS lifecycle, fallback, stale and permission regressions PASS');
