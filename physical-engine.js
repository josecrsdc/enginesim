// EngineSim adapter. Audio core by YigitSalihEmecen / Engine_Sim (MIT).
import { ENGINE_PROFILES, bankAngles } from './profiles.js';
import { combustionSpec, crankRipple } from './pulse.js';
import { ExhaustSystem, IntakeResonator } from './resonators.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ids={v8:'v8cross',v12:'v12',f6:'flat6'};
export class PhysicalEngine {
  constructor(ctx,output){this.ctx=ctx;this.output=output;this.current=null;this.voices=new Set();this.disposed=false;}
  async load(){await this.ctx.audioWorklet.addModule('./combustion-worklet.js');}
  select(id){
    if(this.current?.id===id)return;
    this.disposeGraph();
    const profile=ENGINE_PROFILES[ids[id]],ctx=this.ctx;
    const spec=combustionSpec(profile,bankAngles);
    const node=new AudioWorkletNode(ctx,'engine-combustion',{numberOfInputs:0,numberOfOutputs:spec.outputs,outputChannelCount:Array(spec.outputs).fill(1),processorOptions:spec});
    const exhaust=new ExhaustSystem(ctx,profile),intake=new IntakeResonator(ctx,profile);
    const bus=ctx.createGain(),hp=ctx.createBiquadFilter(),lp=ctx.createBiquadFilter(),gain=ctx.createGain();
    hp.type='highpass';hp.frequency.value=28;hp.Q.value=-3;
    lp.type='lowpass';lp.frequency.value=6500;lp.Q.value=-3;
    gain.gain.value=0;
    for(let i=0;i<profile.banks.length;i++)node.connect(exhaust.inputs[i],i);
    node.connect(intake.input,profile.banks.length);
    exhaust.output.connect(bus);intake.output.connect(bus);
    bus.connect(hp);hp.connect(lp);lp.connect(gain);gain.connect(this.output);
    node.onprocessorerror=()=>{this.mute();this.failed=true;};
    this.current={id,profile,node,exhaust,intake,bus,hp,lp,gain};
  }
  update(s,e){
    this.select(s.engine);
    const g=this.current,now=this.ctx.currentTime;
    const norm=clamp((s.rpm-e.idle)/(e.red-e.idle),0,1);
    const blip=clamp((s.revBlip||0)/.30,0,1),load=clamp(Math.max(s.thr,.62*Math.sin(blip*Math.PI)),0,1);
    const overrun=load<.04&&s.rpm>e.idle*1.6?1:0;
    const shifting=s.shiftTime>0&&s.shiftDirection>0;
    const p={now,dt:1/60,load,throttle:load,rpmNorm:norm,overrun,rpm:s.rpm};
    g.exhaust.update(p);g.intake.update(p);
    const params={f0:Math.max(e.idle,s.rpm)/120,load,amp:(.40+.60*load)*(overrun?.48:1)*(shifting?.36:1),rough:0,ripple:crankRipple(g.profile,s.rpm,load),low:1-norm};
    for(const [key,value] of Object.entries(params))g.node.parameters.get(key).setTargetAtTime(value,now,key==='f0'?.018:.025);
    g.gain.gain.setTargetAtTime(.75,now,.025);
    g.lp.frequency.setTargetAtTime(2400+2600*load+1000*norm,now,.045);
  }
  mute(){
    const g=this.current;if(!g)return;
    const now=this.ctx.currentTime;g.gain.gain.setTargetAtTime(0,now,.012);g.node.parameters.get('amp').setTargetAtTime(0,now,.012);
    for(const voice of this.voices){try{voice.stop();}catch{}}this.voices.clear();
  }
  pop(strength,delay=0){
    const g=this.current;if(!g||this.voices.size>=3)return;
    // A short pressure transient excites the SAME exhaust as the cylinders.
    // No unrelated explosion recording; duration/amplitude vary modestly.
    const ctx=this.ctx,n=Math.round(ctx.sampleRate*.035),buffer=ctx.createBuffer(1,n,ctx.sampleRate),d=buffer.getChannelData(0);
    const decay=.005+Math.random()*.004;
    for(let i=0;i<n;i++){const t=i/ctx.sampleRate;d[i]=(1-Math.exp(-t/.0004))*Math.exp(-t/decay)*(Math.cos(2*Math.PI*110*t)+.3*(Math.random()*2-1));}
    const voice=ctx.createBufferSource(),gain=ctx.createGain();voice.buffer=buffer;gain.gain.value=clamp(strength,0,.6)*1.1;
    voice.connect(gain);gain.connect(g.exhaust.collectorNode);this.voices.add(voice);
    voice.onended=()=>{this.voices.delete(voice);voice.disconnect();gain.disconnect();};voice.start(ctx.currentTime+delay);
  }
  disposeGraph(){
    const g=this.current;if(!g)return;this.mute();
    // Let the output ramp finish before removing the old exhaust tail.
    this.current=null;
    setTimeout(()=>{g.node.port.postMessage('stop');g.node.disconnect();g.exhaust.dispose();g.intake.dispose();for(const n of [g.bus,g.hp,g.lp,g.gain])n.disconnect();},80);
  }
}

