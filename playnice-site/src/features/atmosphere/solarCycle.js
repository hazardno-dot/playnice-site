// Lightweight solar-position and smooth atmosphere interpolation.
// Angles use standard solar astronomy approximations, not weather conditions.
const RAD = Math.PI / 180;
const DAY_MS = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;
function toDays(date) { return date.getTime() / DAY_MS - .5 + J1970 - J2000; }
function rightAscension(l,b) { return Math.atan2(Math.sin(l)*Math.cos(23.4397*RAD)-Math.tan(b)*Math.sin(23.4397*RAD),Math.cos(l)); }
function declination(l,b) { return Math.asin(Math.sin(b)*Math.cos(23.4397*RAD)+Math.cos(b)*Math.sin(23.4397*RAD)*Math.sin(l)); }
function solarAltitude(date,latitude,longitude) {
 const days=toDays(date);
 const M=RAD*(357.5291+0.98560028*days);
 const C=RAD*(1.9148*Math.sin(M)+.02*Math.sin(2*M)+.0003*Math.sin(3*M));
 const L=M+C+RAD*(102.9372+180);
 const dec=declination(L,0);
 const ra=rightAscension(L,0);
 const sidereal=RAD*(280.16+360.9856235*days)-longitude*RAD;
 const hour=sidereal-ra;
 const phi=latitude*RAD;
 return Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(hour))/RAD;
}
const PALETTES = {
 night:   {base:[7,11,23],top:[11,20,42],glow:[133,151,207],warm:0.012,stars:.22},
 dawn:    {base:[22,19,34],top:[69,43,87],glow:[196,116,161],warm:.095,stars:.04},
 sunrise: {base:[39,29,39],top:[123,76,105],glow:[243,153,126],warm:.15,stars:0},
 day:     {base:[18,16,15],top:[39,33,27],glow:[231,181,108],warm:.11,stars:0},
 sunset:  {base:[39,25,29],top:[112,59,48],glow:[242,142,81],warm:.15,stars:0},
 blue:    {base:[13,17,33],top:[42,39,77],glow:[151,119,167],warm:.07,stars:.02},
};
const mix=(a,b,t)=>a+(b-a)*Math.min(1,Math.max(0,t));
function interpolate(a,b,t) {
 const out={};
 for(const k of ['base','top','glow'])out[k]=a[k].map((v,i)=>Math.round(mix(v,b[k][i],t)));
 out.warm=mix(a.warm,b.warm,t);
 out.stars=mix(a.stars,b.stars,t);
 return out;
}
function atmosphere(date,lat,lon) {
 const alt=solarAltitude(date,lat,lon);
 const nextAlt=solarAltitude(new Date(date.getTime()+600000),lat,lon);
 const rising=nextAlt>=alt;
 // Six continuous states. Altitude thresholds avoid clock-time assumptions.
 // Morning: night -> dawn -> sunrise -> day, mirrored evening with sunset -> blue.
 const knots=rising
  ? [[-14,'night'],[-8,'dawn'],[-1,'sunrise'],[11,'day']]
  : [[-14,'night'],[-8,'blue'],[-1,'sunset'],[11,'day']];
 if(alt<=knots[0][0])return {phase:knots[0][1],altitude:alt,colors:PALETTES[knots[0][1]]};
 if(alt>=knots[3][0])return {phase:knots[3][1],altitude:alt,colors:PALETTES[knots[3][1]]};
 for(let i=0;i<knots.length-1;i++){
  const [low,name]=knots[i], [high,next]=knots[i+1];
  if(alt<=high){
   const t=(alt-low)/(high-low);
   return {phase:t<.5?name:next,altitude:alt,colors:interpolate(PALETTES[name],PALETTES[next],t)};
  }
 }
 return {phase:'day',altitude:alt,colors:PALETTES.day};
}
export {solarAltitude, atmosphere};
