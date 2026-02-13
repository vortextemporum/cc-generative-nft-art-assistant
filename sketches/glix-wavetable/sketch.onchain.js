// GLIX WAVETABLE GENERATOR v3.0 (on-chain minimal)
// Hash-based deterministic randomness, GPU-rendered

let hash="0x"+Array(64).fill(0).map(()=>"0123456789abcdef"[Math.floor(Math.random()*16)]).join("");
if(typeof tokenData!=="undefined"&&tokenData.hash)hash=tokenData.hash;

function sfc32(a,b,c,d){return function(){a|=0;b|=0;c|=0;d|=0;let t=(a+b|0)+d|0;d=d+1|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);c=c+t|0;return(t>>>0)/4294967296};}
function initRandom(h){let s=[];for(let i=2;i<66;i+=8)s.push(parseInt(h.slice(i,i+8),16));return sfc32(s[0],s[1],s[2],s[3]);}
let R;
function rnd(a=0,b=1){return R()*(b-a)+a;}
function rndInt(a,b){return Math.floor(rnd(a,b+1));}
function rndChoice(a){return a[Math.floor(R()*a.length)];}
function rndBool(p=0.5){return R()<p;}

let canvas;
const DISPLAY_SIZE=2048;
let glCanvas,gl,shaderProgram,vertexBuffer;
let uLocations={};

const RESOLUTIONS=[128,256,512,1024,2048];
let resolutionIndex=4;
let renderSize=RESOLUTIONS[resolutionIndex];

let params={shape:0,pw:1.0,soften:5.0,y_bend:0.0,fx_bend:0.0,fx_noise:0.0,fx_quantize:0.0,pw_morph:0.0,fx_fold:100.0,fold_mode:0,fx_crush:0.0,wave_mirror:0,wave_invert:0};
let targetParams={...params};
let animSpeed=0.3;
let driftAmount=0.5;

const ANIM_PARAMS=['pw','soften','y_bend','fx_bend','fx_noise','fx_quantize','pw_morph','fx_fold','fx_crush'];
let paramLocks={};
for(let k of ANIM_PARAMS)paramLocks[k]=false;
function setTarget(key,val){if(!paramLocks[key])targetParams[key]=val;}

let lockCategory=3;
const LOCK_CATEGORIES=[{name:'Couple',count:[2,3]},{name:'Multiple',count:[4,5]},{name:'Most',count:[7,8]},{name:'All',count:9}];
function applyRandomLocks(){let cat=LOCK_CATEGORIES[lockCategory];let animCount;if(Array.isArray(cat.count)){animCount=cat.count[0]+rndInt(0,cat.count[1]-cat.count[0]);}else{animCount=cat.count;}let shuffled=[...ANIM_PARAMS];for(let i=shuffled.length-1;i>0;i--){let j=Math.floor(R()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}for(let i=0;i<ANIM_PARAMS.length;i++){paramLocks[shuffled[i]]=i>=animCount;}}

let isAnimating=true;
let animTime=0;
let animMode='drift';
const ANIM_RANGES=[1.0,0.1,0.01];
let paramRanges={};
for(let k of ANIM_PARAMS)paramRanges[k]=1.0;
const ANIM_MODES=['drift','lfo','chaos','sequencer','bounce'];

const EXP_K=4;
const EXP_DENOM=Math.exp(EXP_K)-1;
function expMap(t,mn,mx){t=Math.max(0,Math.min(1,t));return mn+(mx-mn)*(Math.exp(EXP_K*t)-1)/EXP_DENOM;}
function logMap(val,mn,mx){let t=Math.max(0,Math.min(1,(val-mn)/(mx-mn)));return Math.log(1+t*EXP_DENOM)/EXP_K;}

let lorenzX=1.0,lorenzY=1.0,lorenzZ=1.0;
let seqStep=0;
let seqTimer=0;
const SEQ_PRESETS=[
  {shape:0,pw:0.5,soften:5,y_bend:0,fx_bend:0,fx_noise:0,fx_quantize:0,pw_morph:0,fx_fold:100,fx_crush:0},
  {shape:0,pw:0.5,soften:3,y_bend:0.5,fx_bend:200,fx_noise:0,fx_quantize:0,pw_morph:10,fx_fold:500,fx_crush:0},
  {shape:2,pw:0.3,soften:8,y_bend:0.2,fx_bend:0,fx_noise:0.3,fx_quantize:0.4,pw_morph:-20,fx_fold:2000,fx_crush:0},
  {shape:7,pw:0.8,soften:15,y_bend:-0.1,fx_bend:400,fx_noise:0,fx_quantize:0,pw_morph:30,fx_fold:100,fx_crush:0.6},
  {shape:1,pw:0.6,soften:2,y_bend:0.8,fx_bend:100,fx_noise:0.1,fx_quantize:0.2,pw_morph:-15,fx_fold:4000,fx_crush:0},
  {shape:4,pw:0.4,soften:25,y_bend:0,fx_bend:600,fx_noise:0,fx_quantize:0,pw_morph:0,fx_fold:800,fx_crush:0.8},
  {shape:6,pw:0.9,soften:1,y_bend:0.3,fx_bend:0,fx_noise:0.5,fx_quantize:0.6,pw_morph:40,fx_fold:6000,fx_crush:0},
  {shape:5,pw:0.2,soften:40,y_bend:-0.2,fx_bend:800,fx_noise:0,fx_quantize:0,pw_morph:-40,fx_fold:200,fx_crush:0.9},
];
let bouncePhases={};

let ppDitherBayer=false;
let ppDitherBayerScale=0;
let ppDitherNoise=false;
let ppDitherNoiseScale=0;
let ppDitherLines=false;
let ppDitherLinesScale=0;
let ppPosterize=false;
let ppGrain=false;
let ppSharpen=false;
let ppHalftone=false;
let ppHalftoneScale=0;

const TARGET_UPDATE_FPS=30;
let lastRenderTime=0;
let needsRender=true;
let smoothUpscale=false;

const palettes={
  thermal:[[0,0,0],[40,0,80],[120,0,120],[200,50,50],[255,150,0],[255,255,100],[255,255,255]],
  ocean:[[10,10,30],[20,40,80],[30,80,120],[50,150,180],[100,200,220],[180,240,255],[255,255,255]],
  neon:[[10,0,20],[80,0,120],[255,0,150],[0,255,200],[255,255,0],[255,100,255],[255,255,255]],
  sunset:[[20,10,30],[60,20,60],[120,40,80],[200,80,60],[255,150,50],[255,200,100],[255,240,200]],
  monochrome:[[0,0,0],[30,30,35],[60,60,70],[100,100,110],[150,150,160],[200,200,210],[255,255,255]],
  plasma:[[10,0,30],[50,0,100],[150,0,200],[255,50,150],[255,150,100],[255,220,150],[255,255,255]],
  rainbow:[[100,0,150],[0,0,255],[0,200,255],[0,255,100],[255,255,0],[255,150,0],[255,50,50]],
  inferno:[[0,0,4],[40,11,84],[101,21,110],[159,42,99],[212,72,66],[245,125,21],[252,255,164]],
  viridis:[[68,1,84],[72,35,116],[49,104,142],[33,145,140],[53,183,121],[144,215,67],[253,231,37]],
  ember:[[20,5,0],[60,10,0],[140,30,0],[200,60,0],[255,120,20],[255,200,60],[255,240,180]],
  toxic:[[5,10,5],[10,40,10],[20,80,15],[40,140,20],[80,200,30],[160,240,60],[220,255,150]],
  cyberpunk:[[10,0,20],[30,0,60],[80,0,160],[180,0,255],[255,0,200],[255,80,120],[255,200,220]],
  forest:[[10,15,8],[20,40,15],[35,70,25],[55,110,40],[80,150,55],[130,190,80],[200,230,150]],
  lavender:[[15,10,25],[40,20,70],[80,50,130],[130,90,180],[170,130,210],[210,180,235],[240,225,255]],
  rust:[[20,10,5],[60,25,10],[120,50,20],[170,80,30],[200,120,50],[220,170,100],[240,220,180]],
  ice:[[240,250,255],[200,230,255],[150,200,240],[100,160,220],[60,120,200],[30,70,160],[10,30,80]],
  bloodmoon:[[5,0,0],[40,0,5],[100,5,10],[160,15,20],[200,40,30],[230,100,60],[255,200,150]],
  mint:[[10,20,20],[20,60,55],[40,110,100],[80,170,150],[140,210,190],[200,240,220],[240,255,245]],
  noir:[[0,0,0],[15,15,20],[35,30,40],[60,50,65],[90,75,95],[130,110,140],[180,170,190]],
  glitch:[[255,0,0],[0,0,0],[0,255,255],[255,255,255],[255,0,255],[0,0,0],[0,255,0]],
  vhs:[[20,20,200],[200,200,50],[10,10,10],[200,30,30],[50,200,200],[180,20,180],[240,240,240]],
  pop:[[255,50,50],[255,220,0],[50,50,255],[255,50,50],[0,200,100],[255,220,0],[50,50,255]],
  zebra:[[0,0,0],[255,255,255],[0,0,0],[255,255,255],[0,0,0],[255,255,255],[0,0,0]],
  acidhouse:[[0,0,0],[0,255,0],[255,255,0],[0,0,0],[255,0,255],[0,255,0],[255,255,0]],
  bubblegum:[[255,100,200],[100,200,255],[255,220,100],[200,100,255],[100,255,180],[255,100,100],[100,200,255]],
  terminal:[[0,0,0],[0,40,0],[0,255,0],[0,0,0],[0,180,0],[0,255,0],[200,255,200]],
  neotokyo:[[5,5,20],[255,0,80],[0,200,255],[20,10,40],[255,200,0],[0,255,120],[255,0,80]],
  heatmap:[[0,0,80],[0,0,255],[0,255,0],[255,255,0],[255,0,0],[255,0,0],[255,255,255]],
  candy:[[255,255,255],[255,80,120],[255,255,255],[120,200,255],[255,255,255],[255,200,80],[255,255,255]],
  duotone:[[15,10,50],[15,10,50],[15,10,50],[220,90,40],[220,90,40],[220,90,40],[220,90,40]],
  banded:[[10,10,30],[200,180,255],[20,15,40],[255,200,100],[10,10,30],[180,255,200],[20,15,40]],
  coal:[[8,5,5],[18,12,10],[30,18,14],[42,25,18],[55,32,22],[65,40,28],[80,50,35]],
  neonline:[[0,0,0],[0,0,5],[0,255,255],[255,255,255],[255,0,200],[5,0,5],[0,0,0]],
  pastel:[[210,130,155],[130,150,210],[140,200,130],[220,170,120],[120,195,195],[200,140,190],[160,155,215]],
  split:[[0,20,80],[0,60,160],[0,120,220],[255,255,255],[220,40,0],[160,20,0],[80,10,0]],
  prism:[[120,0,0],[200,80,0],[220,200,0],[0,180,40],[0,100,200],[80,0,180],[140,0,120]],
  gold:[[30,15,0],[80,50,5],[160,110,20],[220,180,50],[255,220,100],[255,240,170],[255,250,230]],
  silver:[[20,20,25],[60,65,75],[110,115,130],[160,165,175],[195,200,210],[225,228,235],[250,252,255]],
  copper:[[15,5,0],[60,20,10],[120,55,30],[180,90,50],[210,130,80],[230,175,130],[245,220,200]],
  deepblue:[[0,0,10],[0,5,35],[5,15,70],[15,35,120],[30,65,170],[60,110,210],[120,170,245]],
  crimson:[[15,0,0],[50,0,5],[100,5,15],[155,15,25],[200,35,40],[230,75,70],[255,140,130]],
  jade:[[0,10,5],[0,35,20],[5,70,40],[10,115,65],[30,160,95],[70,200,135],[140,235,185]],
  sepia:[[20,15,10],[50,35,22],[90,65,40],[135,100,65],[180,145,100],[215,190,150],[245,235,215]],
  cyanotype:[[5,10,30],[10,25,70],[20,50,120],[40,90,165],[80,140,200],[150,200,230],[230,240,250]],
  crossprocess:[[0,20,30],[10,60,40],[40,130,50],[120,180,40],[200,200,60],[240,180,100],[255,220,200]],
  redblue:[[0,0,180],[0,0,180],[0,0,180],[240,240,240],[200,0,0],[200,0,0],[200,0,0]],
  traffic:[[200,0,0],[200,0,0],[255,200,0],[255,200,0],[0,160,0],[0,160,0],[0,160,0]],
  stamp:[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[255,255,255],[255,255,255],[255,255,255]],
  terracotta:[[25,12,8],[70,30,15],[130,60,30],[180,95,55],[210,135,85],[230,180,140],[245,225,200]],
  sahara:[[40,25,10],[90,65,30],[150,115,60],[195,165,100],[220,200,145],[240,225,185],[250,245,225]],
  xray:[[255,255,255],[180,200,220],[120,140,180],[60,70,120],[30,30,70],[10,10,30],[0,0,0]],
  infrared:[[255,255,200],[255,200,50],[255,100,0],[200,0,50],[120,0,80],[50,0,60],[10,0,20]],
  overcast:[[30,35,40],[55,60,70],[85,90,100],[120,125,135],[160,165,170],[195,198,200],[225,228,230]],
  fog:[[40,45,55],[80,90,100],[110,125,135],[145,155,165],[180,185,190],[210,215,218],[235,238,240]],
  bruise:[[10,5,15],[30,15,45],[60,30,65],[90,55,75],[130,85,80],[170,130,100],[210,190,160]]
};

let currentPalette='thermal';
let paletteNames=Object.keys(palettes);
let hueShift=0;
let pixelBuffer;

function hueShiftRGB(r,g,b,deg){
  if(Math.abs(deg)<0.5)return[r,g,b];
  let angle=deg*0.01745329252;
  let cosA=Math.cos(angle),sinA=Math.sin(angle);
  let k=0.57735026919;
  let nr=r*cosA+(k*b-k*g)*sinA+k*(k*r+k*g+k*b)*(1-cosA);
  let ng=g*cosA+(k*r-k*b)*sinA+k*(k*r+k*g+k*b)*(1-cosA);
  let nb=b*cosA+(k*g-k*r)*sinA+k*(k*r+k*g+k*b)*(1-cosA);
  return[constrain(nr,0,255),constrain(ng,0,255),constrain(nb,0,255)];
}

const VERT_SRC=`
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){v_uv=a_pos*0.5+0.5;gl_Position=vec4(a_pos,0.0,1.0);}`;

const FRAG_SRC=`
precision highp float;
varying vec2 v_uv;
uniform float u_shape,u_pw,u_soften,u_y_bend,u_fx_bend,u_fx_noise,u_fx_quantize;
uniform float u_pw_morph,u_fx_fold,u_fold_mode,u_fx_crush,u_size;
uniform float u_pp_dither_bayer,u_pp_dither_bayer_scale;
uniform float u_pp_dither_noise,u_pp_dither_noise_scale;
uniform float u_pp_dither_lines,u_pp_dither_lines_scale;
uniform float u_pp_posterize,u_pp_grain,u_pp_sharpen;
uniform float u_pp_halftone,u_pp_halftone_scale;
uniform float u_time,u_canvas_size;
uniform vec3 u_palette[7];
uniform float u_hue_shift,u_wave_mirror,u_wave_invert;

float fract2(float x){return x-floor(x);}
float tanh_approx(float x){if(x>3.0)return 1.0;if(x<-3.0)return -1.0;float x2=x*x;return x*(27.0+x2)/(27.0+9.0*x2);}
float smoothstep2(float edge0,float edge1,float x){float t=clamp((x-edge0)/(edge1-edge0),0.0,1.0);return t*t*(3.0-2.0*t);}

float generateSample(float raw_phase,float scan_pos){
  if(abs(u_y_bend)>0.001){float power=pow(2.0,u_y_bend*-2.5);scan_pos=pow(scan_pos,power);}
  float noisy_phase=raw_phase;
  if(u_fx_noise>0.0){float hash=fract2(sin(raw_phase*12.9898)*43758.5453);noisy_phase=raw_phase+(hash*2.0-1.0)*(u_fx_noise*0.1);}
  float quant_phase=noisy_phase;
  if(u_fx_quantize>0.0){float q_val=pow(u_fx_quantize,0.5);float steps=2.0+(1.0-q_val)*100.0;quant_phase=floor(noisy_phase*steps)/steps;}
  float current_bend=u_fx_bend*scan_pos;
  float final_phase=quant_phase;
  if(abs(current_bend)>0.001){float bend_fact=1.0-(current_bend*0.01);float safe_phase=clamp(quant_phase,0.0001,0.9999);if(safe_phase<0.5){final_phase=pow(safe_phase*2.0,bend_fact)*0.5;}else{final_phase=1.0-pow((1.0-safe_phase)*2.0,bend_fact)*0.5;}}
  if(u_wave_mirror>0.5)final_phase=1.0-final_phase;
  float morph_amt=u_pw_morph*scan_pos*0.1;
  float shift_val=(u_pw-0.5)+morph_amt;
  float shifted_phase=fract2(final_phase+shift_val);
  int sel=int(floor(u_shape));
  float samp=0.0;
  if(sel==0){samp=sin(shifted_phase*6.28318530718);}
  else if(sel==1){samp=1.0-abs((shifted_phase*2.0)-1.0)*2.0;}
  else if(sel==2){samp=(shifted_phase*2.0)-1.0;}
  else if(sel==3){float cw=clamp(u_pw+morph_amt,0.0,1.0);float edge=max(0.001,0.5/u_soften);samp=smoothstep2(cw-edge,cw+edge,final_phase)*-2.0+1.0;}
  else if(sel==4){samp=sin(shifted_phase*6.28318530718);samp=samp>0.0?samp*2.0-1.0:-1.0;}
  else if(sel==5){samp=sin(shifted_phase*6.28318530718);samp=floor(samp*4.0)/4.0;}
  else if(sel==6){float t=shifted_phase*2.0-1.0;samp=1.0-2.0*t*t;}
  else if(sel==7){float s1=fract2(shifted_phase)*2.0-1.0;float s2=fract2(shifted_phase*1.006+0.1)*2.0-1.0;float s3=fract2(shifted_phase*0.994+0.2)*2.0-1.0;samp=(s1+s2+s3)/3.0;}
  else if(sel==8){float n=1.0+scan_pos*7.0;float n_lo=floor(n);float n_hi=n_lo+1.0;float frac_n=n-n_lo;samp=sin(n_lo*3.14159265*shifted_phase)*(1.0-frac_n)+sin(n_hi*3.14159265*shifted_phase)*frac_n;}
  else if(sel==9){float x=shifted_phase*2.0-1.0;x=clamp(x,-0.999,0.999);float n=1.0+scan_pos*7.0;float n_lo=floor(n);float n_hi=n_lo+1.0;float frac_n=n-n_lo;samp=cos(n_lo*acos(x))*(1.0-frac_n)+cos(n_hi*acos(x))*frac_n;}
  else if(sel==10){float mod_index=scan_pos*8.0;float ratio=2.0+(u_pw-0.5)*2.0;samp=sin(6.28318530718*shifted_phase+mod_index*sin(6.28318530718*ratio*shifted_phase));}
  else if(sel==11){float num_h=1.0+scan_pos*15.0;float n_lo_h=floor(num_h);float frac_h=num_h-n_lo_h;samp=0.0;for(int k=1;k<=16;k++){float fk=float(k);if(fk>n_lo_h+1.0)break;float amp=fk<=n_lo_h?1.0:frac_h;samp+=amp*sin(fk*6.28318530718*shifted_phase)/fk;}samp*=0.63;}
  else if(sel==12){float b=2.0+u_pw*3.0;float a=1.5;float num_oct=1.0+scan_pos*11.0;float n_lo_f=floor(num_oct);float frac_f=num_oct-n_lo_f;samp=0.0;float bn=1.0;float an=1.0;for(int n=0;n<12;n++){float fn=float(n);if(fn>n_lo_f+1.0)break;float amp=fn<=n_lo_f?1.0:frac_f;samp+=amp*sin(bn*3.14159265*shifted_phase)/an;bn*=b;an*=a;}samp*=0.5;}
  else if(sel==13){float k=1.0+scan_pos*7.0;float chirp_phase=pow(clamp(shifted_phase,0.001,0.999),k);samp=sin(chirp_phase*6.28318530718);}
  else if(sel==14){float formant_freq=2.0+scan_pos*14.0;float bw=0.3+u_pw*1.2;samp=0.0;for(int k=1;k<=16;k++){float fk=float(k);float dist=(fk-formant_freq)/bw;float env=exp(-0.5*dist*dist);samp+=env*sin(fk*6.28318530718*shifted_phase);}samp*=0.4;}
  else if(sel==15){float r=2.5+scan_pos*1.5;float x=clamp(shifted_phase,0.01,0.99);for(int i=0;i<24;i++){x=r*x*(1.0-x);}samp=x*2.0-1.0;}
  if(u_wave_invert>0.5)samp=-samp;
  samp=tanh_approx(samp*u_soften);
  float current_crush=u_fx_crush*scan_pos;
  if(current_crush>0.0){float c_steps=max(1.0,2.0+(1.0-current_crush)*50.0);samp=floor(samp*c_steps)/c_steps;}
  float current_fold=u_fx_fold*scan_pos;
  if(current_fold>0.0){
    int fm=int(u_fold_mode);
    if(fm==0){float drive=1.0+(current_fold*0.08);samp=sin(clamp(samp*drive,-100000.0,100000.0));}
    else if(fm==1){float drive=1.0+(current_fold*0.03);samp=sin(clamp(samp*drive,-100000.0,100000.0));}
    else if(fm==2){float drive=1.0+(current_fold*0.01);samp=sin(clamp(samp*drive,-100000.0,100000.0));}
    else if(fm==3){float drive=1.0+(current_fold*0.004);samp=sin(clamp(samp*drive,-100000.0,100000.0));}
    else if(fm==4){float drive=1.0+(current_fold*0.0015);samp=sin(clamp(samp*drive,-100000.0,100000.0));}
    else if(fm==5){float drive=1.0+(current_fold*0.02);float folded=samp*drive;folded=folded-4.0*floor((folded+1.0)/4.0);if(abs(folded)>1.0){folded=folded>0.0?2.0-folded:-2.0-folded;}samp=clamp(folded,-1.0,1.0);}
    else if(fm==7){float drive=1.0+(current_fold*0.25);samp=sin(clamp(samp*drive,-100000.0,100000.0));}
    else if(fm==8){float drive=1.0+(current_fold*0.05);float folded=samp*drive;folded=folded-4.0*floor((folded+1.0)/4.0);if(abs(folded)>1.0){folded=folded>0.0?2.0-folded:-2.0-folded;}samp=clamp(folded,-1.0,1.0);}
    else{float drive=1.0+(current_fold*0.005);float folded=samp*drive;folded=folded-4.0*floor((folded+1.0)/4.0);if(abs(folded)>1.0){folded=folded>0.0?2.0-folded:-2.0-folded;}samp=clamp(folded,-1.0,1.0);}
  }
  return clamp(samp,-1.0,1.0);
}

vec3 paletteAt(int i){if(i<=0)return u_palette[0];if(i==1)return u_palette[1];if(i==2)return u_palette[2];if(i==3)return u_palette[3];if(i==4)return u_palette[4];if(i==5)return u_palette[5];return u_palette[6];}
vec3 getPaletteColor(float t){t=clamp(t,0.0,1.0);float scaledT=t*6.0;int idx=int(floor(scaledT));float f=scaledT-floor(scaledT);return mix(paletteAt(idx),paletteAt(idx+1),f);}

float bayerMatrix(vec2 pos){int x=int(mod(pos.x,4.0));int y=int(mod(pos.y,4.0));int idx=x+y*4;if(idx==0)return 0.0/16.0;if(idx==1)return 8.0/16.0;if(idx==2)return 2.0/16.0;if(idx==3)return 10.0/16.0;if(idx==4)return 12.0/16.0;if(idx==5)return 4.0/16.0;if(idx==6)return 14.0/16.0;if(idx==7)return 6.0/16.0;if(idx==8)return 3.0/16.0;if(idx==9)return 11.0/16.0;if(idx==10)return 1.0/16.0;if(idx==11)return 9.0/16.0;if(idx==12)return 15.0/16.0;if(idx==13)return 7.0/16.0;if(idx==14)return 13.0/16.0;return 5.0/16.0;}

vec3 computeColor(vec2 uv){
  float raw_phase=(uv.x*u_size+1.0)/(u_size+1.0);
  float scan_pos=(uv.y*u_size+1.0)/(u_size+1.0);
  float sample_val=generateSample(raw_phase,scan_pos);
  float colorVal=(sample_val+1.0)*0.5;
  vec3 col=getPaletteColor(colorVal);
  if(abs(u_hue_shift)>0.5){float angle=u_hue_shift*0.01745329252;float cosA=cos(angle);float sinA=sin(angle);float k=0.57735026919;vec3 kv=vec3(k);col=col*cosA+cross(kv,col)*sinA+kv*dot(kv,col)*(1.0-cosA);col=clamp(col,0.0,1.0);}
  return col;
}

void main(){
  vec3 col=computeColor(v_uv);
  if(u_pp_sharpen>0.5){vec2 texel=vec2(1.0/u_canvas_size);vec3 cN=computeColor(v_uv+vec2(0.0,texel.y));vec3 cS=computeColor(v_uv-vec2(0.0,texel.y));vec3 cE=computeColor(v_uv+vec2(texel.x,0.0));vec3 cW=computeColor(v_uv-vec2(texel.x,0.0));vec3 blur=(cN+cS+cE+cW)*0.25;col=col+(col-blur)*1.2;}
  vec2 pixCoord=v_uv*u_canvas_size;
  if(u_pp_dither_bayer>0.5){vec2 ditherCoord=floor(pixCoord/u_pp_dither_bayer_scale);float dith=bayerMatrix(ditherCoord)-0.5;col+=dith*(0.06+u_pp_dither_bayer_scale*0.015);}
  if(u_pp_dither_noise>0.5){vec2 cell=floor(pixCoord/u_pp_dither_noise_scale);float noise=fract2(sin(dot(cell,vec2(12.9898,78.233)))*43758.5453)-0.5;col+=noise*(0.08+u_pp_dither_noise_scale*0.012);}
  if(u_pp_dither_lines>0.5){float row=floor(pixCoord.y/u_pp_dither_lines_scale);float lum=dot(col,vec3(0.299,0.587,0.114));float pattern=mod(row,2.0);float strength=0.06+u_pp_dither_lines_scale*0.02;col+=(pattern-0.5)*strength*(1.0-lum*0.5);}
  if(u_pp_posterize>0.5){float levels=6.0;col=floor(col*levels+0.5)/levels;}
  if(u_pp_grain>0.5){float grain=fract2(sin(dot(pixCoord+u_time,vec2(12.9898,78.233)))*43758.5453);col+=(grain-0.5)*0.12;}
  if(u_pp_halftone>0.5){float dotSize=u_pp_halftone_scale;vec2 cell=floor(pixCoord/dotSize)*dotSize+dotSize*0.5;float dist=length(pixCoord-cell)/(dotSize*0.5);float lum=dot(col,vec3(0.299,0.587,0.114));col=mix(vec3(0.0),col,step(dist,lum));}
  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;

let useWebGL=false;

function initWebGL(){
  glCanvas=document.createElement('canvas');
  glCanvas.width=renderSize;glCanvas.height=renderSize;
  gl=glCanvas.getContext('webgl',{preserveDrawingBuffer:true});
  if(!gl)return false;
  let vs=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vs,VERT_SRC);gl.compileShader(vs);
  if(!gl.getShaderParameter(vs,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(vs));return false;}
  let fs=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fs,FRAG_SRC);gl.compileShader(fs);
  if(!gl.getShaderParameter(fs,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(fs));return false;}
  shaderProgram=gl.createProgram();gl.attachShader(shaderProgram,vs);gl.attachShader(shaderProgram,fs);gl.linkProgram(shaderProgram);
  if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(shaderProgram));return false;}
  gl.useProgram(shaderProgram);
  vertexBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  let aPos=gl.getAttribLocation(shaderProgram,'a_pos');gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
  let names=['u_shape','u_pw','u_soften','u_y_bend','u_fx_bend','u_fx_noise','u_fx_quantize','u_pw_morph','u_fx_fold','u_fold_mode','u_fx_crush','u_size','u_pp_dither_bayer','u_pp_dither_bayer_scale','u_pp_dither_noise','u_pp_dither_noise_scale','u_pp_dither_lines','u_pp_dither_lines_scale','u_pp_posterize','u_pp_grain','u_pp_sharpen','u_pp_halftone','u_pp_halftone_scale','u_time','u_canvas_size','u_hue_shift','u_wave_mirror','u_wave_invert'];
  for(let n of names)uLocations[n]=gl.getUniformLocation(shaderProgram,n);
  for(let i=0;i<7;i++)uLocations['u_palette_'+i]=gl.getUniformLocation(shaderProgram,'u_palette['+i+']');
  return true;
}

function resizeGLCanvas(){
  if(!gl)return;glCanvas.width=renderSize;glCanvas.height=renderSize;gl.viewport(0,0,renderSize,renderSize);
  gl.useProgram(shaderProgram);gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
  let aPos=gl.getAttribLocation(shaderProgram,'a_pos');gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
}

function setup(){
  canvas=createCanvas(DISPLAY_SIZE,DISPLAY_SIZE);
  pixelDensity(1);noSmooth();
  useWebGL=initWebGL();
  if(!useWebGL)createPixelBuffer();
  generateFeatures();
}

function createPixelBuffer(){
  pixelBuffer=createGraphics(renderSize,renderSize);pixelBuffer.pixelDensity(1);
  if(useWebGL)resizeGLCanvas();needsRender=true;
}

function draw(){
  animTime+=deltaTime*0.001;
  if(isAnimating){updateAnimation();interpolateParams();needsRender=true;}
  let currentTime=millis();
  if(needsRender&&(currentTime-lastRenderTime)>=1000/TARGET_UPDATE_FPS){
    if(useWebGL)renderWavetableGPU();else renderWavetableCPU();
    lastRenderTime=currentTime;needsRender=false;
  }
  if(useWebGL){drawingContext.imageSmoothingEnabled=smoothUpscale;drawingContext.drawImage(glCanvas,0,0,DISPLAY_SIZE,DISPLAY_SIZE);}
  else{image(pixelBuffer,0,0,DISPLAY_SIZE,DISPLAY_SIZE);}
}

function updateAnimation(){
  switch(animMode){case'drift':animDrift();break;case'lfo':animLFO();break;case'chaos':animChaos();break;case'sequencer':animSequencer();break;case'bounce':animBounce();break;}
}

function animDrift(){
  let drift=driftAmount;let speed=animSpeed*0.1;
  setTarget('y_bend',map(noise(animTime*speed*0.3),0,1,-0.25,1.0)*drift);
  setTarget('fx_bend',expMap(noise(animTime*speed*0.2+100),0,500)*drift);
  setTarget('pw_morph',map(noise(animTime*speed*0.4+200),0,1,-25,25)*drift);
  setTarget('fx_fold',expMap(noise(animTime*speed*0.15+300),0,2000)*drift+100*(1-drift));
  setTarget('pw',map(noise(animTime*speed*0.5+400),0,1,0.2,1.0));
  setTarget('fx_noise',map(noise(animTime*speed*0.25+500),0,1,0,0.3)*drift);
  setTarget('fx_quantize',map(noise(animTime*speed*0.2+600),0,1,0,0.5)*drift);
  setTarget('soften',map(noise(animTime*speed*0.35+700),0,1,1,20));
}

function animLFO(){
  let t=animTime*animSpeed*0.5;let d=driftAmount;
  setTarget('pw',0.5+Math.sin(t*0.7)*0.4*d);setTarget('soften',10+Math.sin(t*0.3)*9*d);
  setTarget('y_bend',Math.sin(t*0.2)*0.5*d);setTarget('fx_bend',expMap(Math.sin(t*0.15)*0.5+0.5,0,400)*d);
  setTarget('pw_morph',Math.sin(t*0.4)*30*d);setTarget('fx_fold',expMap(Math.sin(t*0.1)*0.5+0.5,0,3000)*d+100*(1-d));
  setTarget('fx_noise',(Math.sin(t*0.6)*0.5+0.5)*0.3*d);setTarget('fx_quantize',(Math.sin(t*0.25)*0.5+0.5)*0.4*d);
  setTarget('fx_crush',expMap(Math.sin(t*0.08)*0.5+0.5,0,1)*d);
}

function animChaos(){
  let dt=0.005*animSpeed;let sigma=10,rho=28,beta=8/3;let d=driftAmount;
  let dx=sigma*(lorenzY-lorenzX)*dt;let dy=(lorenzX*(rho-lorenzZ)-lorenzY)*dt;let dz=(lorenzX*lorenzY-beta*lorenzZ)*dt;
  lorenzX+=dx;lorenzY+=dy;lorenzZ+=dz;
  let nx=lorenzX/20,ny=lorenzY/25,nz=(lorenzZ-25)/20;
  setTarget('pw',0.5+nx*0.4*d);setTarget('soften',10+ny*15*d);setTarget('y_bend',nx*0.5*d);
  setTarget('fx_bend',expMap((nz+1)*0.5,0,500)*d);setTarget('pw_morph',ny*30*d);
  setTarget('fx_fold',expMap(Math.abs(nz),0,4000)*d+100*(1-d));
  setTarget('fx_noise',Math.abs(nx)*0.3*d);setTarget('fx_quantize',Math.abs(ny)*0.4*d);
  setTarget('fx_crush',expMap(Math.abs(nz),0,1)*d);
}

function animSequencer(){
  let stepDur=4.0/animSpeed;seqTimer+=deltaTime*0.001;
  if(seqTimer>=stepDur){seqTimer-=stepDur;seqStep=(seqStep+1)%SEQ_PRESETS.length;let preset=SEQ_PRESETS[seqStep];targetParams.shape=preset.shape;params.shape=preset.shape;}
  let preset=SEQ_PRESETS[seqStep];let nextPreset=SEQ_PRESETS[(seqStep+1)%SEQ_PRESETS.length];
  let t=seqTimer/stepDur;t=t*t*(3-2*t);let d=driftAmount;
  setTarget('pw',lerp(preset.pw,nextPreset.pw,t*d));setTarget('soften',lerp(preset.soften,nextPreset.soften,t*d));
  setTarget('y_bend',lerp(preset.y_bend,nextPreset.y_bend,t*d));setTarget('fx_bend',lerp(preset.fx_bend,nextPreset.fx_bend,t*d));
  setTarget('fx_noise',lerp(preset.fx_noise,nextPreset.fx_noise,t*d));setTarget('fx_quantize',lerp(preset.fx_quantize,nextPreset.fx_quantize,t*d));
  setTarget('pw_morph',lerp(preset.pw_morph,nextPreset.pw_morph,t*d));setTarget('fx_fold',lerp(preset.fx_fold,nextPreset.fx_fold,t*d));
  setTarget('fx_crush',lerp(preset.fx_crush,nextPreset.fx_crush,t*d));
}

function animBounce(){
  let t=animTime*animSpeed*0.3;let d=driftAmount;
  setTarget('pw',map(Math.abs(Math.sin(t*1.0+bouncePhases.pw)),0,1,0.1,0.95)*d+0.5*(1-d));
  setTarget('soften',map(Math.abs(Math.sin(t*0.7+bouncePhases.soften)),0,1,1,40));
  setTarget('y_bend',Math.sin(t*0.3+bouncePhases.y_bend)*0.6*d);
  setTarget('fx_bend',expMap(Math.abs(Math.sin(t*0.2+bouncePhases.fx_bend)),0,700)*d);
  setTarget('fx_noise',Math.abs(Math.sin(t*1.3+bouncePhases.fx_noise))*0.3*d);
  setTarget('fx_quantize',Math.abs(Math.sin(t*0.9+bouncePhases.fx_quantize))*0.35*d);
  setTarget('pw_morph',Math.sin(t*0.5+bouncePhases.pw_morph)*40*d);
  setTarget('fx_fold',expMap(Math.abs(Math.sin(t*0.13+bouncePhases.fx_fold)),0,8000)*d+50);
  setTarget('fx_crush',expMap(Math.abs(Math.sin(t*0.17+bouncePhases.fx_crush)),0,1)*d);
}

function interpolateParams(){
  let dt=deltaTime*0.001;let base=dt*animSpeed*2;
  for(let k of ANIM_PARAMS){let spd=1.0-pow(0.5,base*paramRanges[k]);params[k]=lerp(params[k],targetParams[k],spd);}
}

function generateSample(raw_phase,scan_pos){
  let y_bend=params.y_bend;if(abs(y_bend)>0.001){let power=pow(2.0,y_bend*-2.5);scan_pos=pow(scan_pos,power);}
  let noisy_phase=raw_phase;
  if(params.fx_noise>0.0){let hash=fract(sin(raw_phase*12.9898)*43758.5453);noisy_phase=raw_phase+(hash*2.0-1.0)*(params.fx_noise*0.1);}
  let quant_phase=noisy_phase;
  if(params.fx_quantize>0.0){let q_val=pow(params.fx_quantize,0.5);let steps=2.0+(1.0-q_val)*100.0;quant_phase=floor(noisy_phase*steps)/steps;}
  let current_bend=params.fx_bend*scan_pos;let final_phase=quant_phase;
  if(abs(current_bend)>0.001){let bend_fact=1.0-(current_bend*0.01);let safe_phase=constrain(quant_phase,0.0001,0.9999);if(safe_phase<0.5){final_phase=pow(safe_phase*2.0,bend_fact)*0.5;}else{final_phase=1.0-pow((1.0-safe_phase)*2.0,bend_fact)*0.5;}}
  if(params.wave_mirror)final_phase=1.0-final_phase;
  let morph_amt=params.pw_morph*scan_pos*0.1;let shift_val=(params.pw-0.5)+morph_amt;let shifted_phase=fract(final_phase+shift_val);
  let sel=floor(params.shape);let samp=0.0;
  if(sel===0){samp=sin(shifted_phase*TWO_PI);}
  else if(sel===1){samp=1.0-abs((shifted_phase*2.0)-1.0)*2.0;}
  else if(sel===2){samp=(shifted_phase*2.0)-1.0;}
  else if(sel===3){let current_width=constrain(params.pw+morph_amt,0.0,1.0);let edge=Math.max(0.001,0.5/params.soften);let t=constrain((final_phase-(current_width-edge))/(2*edge),0,1);samp=1.0-t*t*(3-2*t)*2.0;}
  else if(sel===4){samp=sin(shifted_phase*TWO_PI);samp=samp>0?samp*2.0-1.0:-1.0;}
  else if(sel===5){samp=sin(shifted_phase*TWO_PI);samp=floor(samp*4.0)/4.0;}
  else if(sel===6){let t=shifted_phase*2.0-1.0;samp=1.0-2.0*t*t;}
  else if(sel===7){let s1=fract(shifted_phase)*2.0-1.0;let s2=fract(shifted_phase*1.006+0.1)*2.0-1.0;let s3=fract(shifted_phase*0.994+0.2)*2.0-1.0;samp=(s1+s2+s3)/3.0;}
  else if(sel===8){let n=1.0+scan_pos*7.0;let n_lo=floor(n);let n_hi=n_lo+1;let frac_n=n-n_lo;samp=sin(n_lo*PI*shifted_phase)*(1.0-frac_n)+sin(n_hi*PI*shifted_phase)*frac_n;}
  else if(sel===9){let x=shifted_phase*2.0-1.0;x=constrain(x,-0.999,0.999);let n=1.0+scan_pos*7.0;let n_lo=floor(n);let n_hi=n_lo+1;let frac_n=n-n_lo;samp=cos(n_lo*acos(x))*(1.0-frac_n)+cos(n_hi*acos(x))*frac_n;}
  else if(sel===10){let mod_index=scan_pos*8.0;let ratio=2.0+(params.pw-0.5)*2.0;samp=sin(TWO_PI*shifted_phase+mod_index*sin(TWO_PI*ratio*shifted_phase));}
  else if(sel===11){let num_h=1.0+scan_pos*15.0;let n_lo_h=floor(num_h);let frac_h=num_h-n_lo_h;samp=0.0;for(let k=1;k<=16;k++){if(k>n_lo_h+1)break;let amp=k<=n_lo_h?1.0:frac_h;samp+=amp*sin(k*TWO_PI*shifted_phase)/k;}samp*=0.63;}
  else if(sel===12){let b=2.0+params.pw*3.0;let a=1.5;let num_oct=1.0+scan_pos*11.0;let n_lo_f=floor(num_oct);let frac_f=num_oct-n_lo_f;samp=0.0;let bn=1.0,an=1.0;for(let n=0;n<12;n++){if(n>n_lo_f+1)break;let amp=n<=n_lo_f?1.0:frac_f;samp+=amp*sin(bn*PI*shifted_phase)/an;bn*=b;an*=a;}samp*=0.5;}
  else if(sel===13){let k=1.0+scan_pos*7.0;let chirp_phase=pow(constrain(shifted_phase,0.001,0.999),k);samp=sin(chirp_phase*TWO_PI);}
  else if(sel===14){let formant_freq=2.0+scan_pos*14.0;let bw=0.3+params.pw*1.2;samp=0.0;for(let k=1;k<=16;k++){let dist=(k-formant_freq)/bw;let env=exp(-0.5*dist*dist);samp+=env*sin(k*TWO_PI*shifted_phase);}samp*=0.4;}
  else if(sel===15){let r=2.5+scan_pos*1.5;let x=constrain(shifted_phase,0.01,0.99);for(let i=0;i<24;i++){x=r*x*(1.0-x);}samp=x*2.0-1.0;}
  if(params.wave_invert)samp=-samp;
  samp=tanh_approx(samp*params.soften);
  let current_crush=params.fx_crush*scan_pos;
  if(current_crush>0.0){let c_steps=max(1.0,2.0+(1.0-current_crush)*50.0);samp=floor(samp*c_steps)/c_steps;}
  let current_fold=params.fx_fold*scan_pos;
  if(current_fold>0.0){
    let fm=floor(params.fold_mode);
    if(fm===0){samp=sin(constrain(samp*(1.0+current_fold*0.08),-100000,100000));}
    else if(fm===1){samp=sin(constrain(samp*(1.0+current_fold*0.03),-100000,100000));}
    else if(fm===2){samp=sin(constrain(samp*(1.0+current_fold*0.01),-100000,100000));}
    else if(fm===3){samp=sin(constrain(samp*(1.0+current_fold*0.004),-100000,100000));}
    else if(fm===4){samp=sin(constrain(samp*(1.0+current_fold*0.0015),-100000,100000));}
    else if(fm===5||fm===8||fm===6){let m=[0.02,0,0,0,0,0.02,0.005,0,0.05];let drive=1.0+(current_fold*m[fm]);let folded=samp*drive;folded=folded-4.0*floor((folded+1.0)/4.0);samp=abs(folded)<=1.0?folded:(folded>0.0?2.0-folded:-2.0-folded);samp=constrain(samp,-1.0,1.0);}
    else if(fm===7){samp=sin(constrain(samp*(1.0+current_fold*0.25),-100000,100000));}
    else{let drive=1.0+(current_fold*0.005);let folded=samp*drive;folded=folded-4.0*floor((folded+1.0)/4.0);samp=abs(folded)<=1.0?folded:(folded>0.0?2.0-folded:-2.0-folded);samp=constrain(samp,-1.0,1.0);}
  }
  if(isNaN(samp))samp=0.0;
  return constrain(samp,-1.0,1.0);
}

function renderWavetableGPU(){
  let palette=palettes[currentPalette];
  if(glCanvas.width!==renderSize||glCanvas.height!==renderSize){glCanvas.width=renderSize;glCanvas.height=renderSize;}
  gl.viewport(0,0,renderSize,renderSize);gl.useProgram(shaderProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
  let aPos=gl.getAttribLocation(shaderProgram,'a_pos');gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
  gl.uniform1f(uLocations.u_shape,params.shape);gl.uniform1f(uLocations.u_pw,params.pw);
  gl.uniform1f(uLocations.u_soften,params.soften);gl.uniform1f(uLocations.u_y_bend,params.y_bend);
  gl.uniform1f(uLocations.u_fx_bend,params.fx_bend);gl.uniform1f(uLocations.u_fx_noise,params.fx_noise);
  gl.uniform1f(uLocations.u_fx_quantize,params.fx_quantize);gl.uniform1f(uLocations.u_pw_morph,params.pw_morph);
  gl.uniform1f(uLocations.u_fx_fold,params.fx_fold);gl.uniform1f(uLocations.u_fold_mode,params.fold_mode);
  gl.uniform1f(uLocations.u_fx_crush,params.fx_crush);gl.uniform1f(uLocations.u_size,renderSize);
  gl.uniform1f(uLocations.u_pp_dither_bayer,ppDitherBayer?1:0);gl.uniform1f(uLocations.u_pp_dither_bayer_scale,[1,2,4,8][ppDitherBayerScale]);
  gl.uniform1f(uLocations.u_pp_dither_noise,ppDitherNoise?1:0);gl.uniform1f(uLocations.u_pp_dither_noise_scale,[1,2,4,8][ppDitherNoiseScale]);
  gl.uniform1f(uLocations.u_pp_dither_lines,ppDitherLines?1:0);gl.uniform1f(uLocations.u_pp_dither_lines_scale,[1,2,4,8][ppDitherLinesScale]);
  gl.uniform1f(uLocations.u_pp_posterize,ppPosterize?1:0);gl.uniform1f(uLocations.u_pp_grain,ppGrain?1:0);
  gl.uniform1f(uLocations.u_pp_sharpen,ppSharpen?1:0);gl.uniform1f(uLocations.u_pp_halftone,ppHalftone?1:0);
  gl.uniform1f(uLocations.u_pp_halftone_scale,[4,6,10,16][ppHalftoneScale]);
  gl.uniform1f(uLocations.u_time,animTime*100.0);gl.uniform1f(uLocations.u_canvas_size,renderSize);
  for(let i=0;i<7;i++){let c=palette[i]||palette[palette.length-1];gl.uniform3f(uLocations['u_palette_'+i],c[0]/255,c[1]/255,c[2]/255);}
  gl.uniform1f(uLocations.u_hue_shift,hueShift);gl.uniform1f(uLocations.u_wave_mirror,params.wave_mirror);gl.uniform1f(uLocations.u_wave_invert,params.wave_invert);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}

function renderWavetableCPU(){
  pixelBuffer.loadPixels();let palette=palettes[currentPalette];let size=renderSize;
  for(let y=0;y<size;y++){let scan_pos=(y+1)/(size+1);
    for(let x=0;x<size;x++){let raw_phase=(x+1)/(size+1);let sample=generateSample(raw_phase,scan_pos);
      let colorVal=(sample+1)*0.5;let col=getColorFromPalette(colorVal,palette);
      if(Math.abs(hueShift)>0.5)col=hueShiftRGB(col[0],col[1],col[2],hueShift);
      let idx=(y*size+x)*4;pixelBuffer.pixels[idx]=col[0];pixelBuffer.pixels[idx+1]=col[1];pixelBuffer.pixels[idx+2]=col[2];pixelBuffer.pixels[idx+3]=255;
    }}
  pixelBuffer.updatePixels();
}

function getColorFromPalette(t,palette){
  t=constrain(t,0,1);let scaledT=t*(palette.length-1);let idx=floor(scaledT);let f=scaledT-idx;
  if(idx>=palette.length-1)return palette[palette.length-1];
  let c1=palette[idx];let c2=palette[idx+1];return[lerp(c1[0],c2[0],f),lerp(c1[1],c2[1],f),lerp(c1[2],c2[2],f)];
}

function fract(x){return x-floor(x);}
function tanh_approx(x){if(x>3)return 1;if(x<-3)return-1;let x2=x*x;return x*(27+x2)/(27+9*x2);}

function setResolution(idx){
  resolutionIndex=constrain(idx,0,RESOLUTIONS.length-1);renderSize=RESOLUTIONS[resolutionIndex];
  createPixelBuffer();
}

function randomizeParamRanges(){for(let k of ANIM_PARAMS)paramRanges[k]=rndChoice(ANIM_RANGES);}

let features={};
function generateFeatures(){
  R=initRandom(hash);
  params.shape=rndInt(0,15);params.pw=rnd();params.soften=expMap(R(),0.001,50);params.y_bend=rnd(-0.25,1.0);
  params.fx_bend=rndBool(0.3)?0:expMap(Math.pow(R(),1.5),0,1000);
  params.fx_noise=rndBool(0.4)?0:Math.pow(R(),3)*0.8;
  params.fx_quantize=rndBool(0.4)?0:Math.pow(R(),3)*0.7;
  params.pw_morph=Math.pow(R(),1.5)*50*(rndBool()?-1:1);
  let foldRoll=R();
  if(foldRoll<0.3)params.fx_fold=rnd(0,50);
  else if(foldRoll<0.99)params.fx_fold=expMap(Math.pow(R(),1.5),0,2000);
  else params.fx_fold=expMap(R(),5000,10000);
  params.fold_mode=rndInt(0,8);
  params.fx_crush=rndBool(0.35)?0:expMap(Math.pow(R(),1.5),0,1);
  params.wave_mirror=rndBool()?1:0;params.wave_invert=rndBool()?1:0;
  currentPalette=rndChoice(paletteNames);hueShift=rndInt(0,359);
  let animModeChoice=rndChoice(ANIM_MODES);let resChoice=rndInt(0,RESOLUTIONS.length-1);
  lockCategory=rndInt(0,LOCK_CATEGORIES.length-1);
  randomizeParamRanges();applyRandomLocks();
  let bKeys=['pw','soften','y_bend','fx_bend','fx_noise','fx_quantize','pw_morph','fx_fold','fx_crush'];
  for(let k of bKeys)bouncePhases[k]=R()*Math.PI*2;
  let aSpd=rnd(0.15,0.6);let aDrift=rnd(0.2,0.8);
  let unlocked=ANIM_PARAMS.filter(k=>!paramLocks[k]);
  let visualParams=['fx_fold','fx_bend','pw_morph','y_bend','fx_noise','fx_quantize'];
  let unlockedVisual=unlocked.filter(k=>visualParams.includes(k));
  if(unlocked.length>0&&!unlocked.some(k=>paramRanges[k]>=1.0)){let pick=unlockedVisual.length>0?unlockedVisual:unlocked;paramRanges[rndChoice(pick)]=1.0;}
  ppDitherBayer=rndBool(0.07);ppDitherBayerScale=rndInt(0,3);
  ppDitherNoise=rndBool(0.05);ppDitherNoiseScale=rndInt(0,3);
  ppDitherLines=rndBool(0.05);ppDitherLinesScale=rndInt(0,3);
  ppPosterize=rndBool(0.06);ppGrain=rndBool(0.08);ppSharpen=rndBool(0.06);
  ppHalftone=rndBool(0.05);ppHalftoneScale=rndInt(0,3);
  features={
    oscillator:['Sine','Triangle','Sawtooth','Pulse','HalfRect','Staircase','Parabolic','SuperSaw','Schrodinger','Chebyshev','FM','Harmonic','Fractal','Chirp','Formant','Chaos'][params.shape],
    palette:currentPalette,hueShift:hueShift,foldMode:params.fold_mode,animMode:animModeChoice,
    hasFold:params.fx_fold>50,hasCrush:params.fx_crush>0,mirror:params.wave_mirror===1,invert:params.wave_invert===1
  };
  targetParams={...params};animSpeed=aSpd;driftAmount=aDrift;
  animMode=animModeChoice;
  if(animMode==='chaos'){lorenzX=1;lorenzY=1;lorenzZ=1;}
  if(animMode==='sequencer'){seqStep=0;seqTimer=0;}
  setResolution(resChoice);needsRender=true;
}

window.getFeatures=function(){return features;};
