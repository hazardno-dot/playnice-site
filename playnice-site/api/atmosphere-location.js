// Read-only, privacy-preserving approximate location for the preview solar cycle.
// Never returns the visitor IP or raw request headers.
module.exports = function handler(req,res) {
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const rawLat=Number(req.headers['x-vercel-ip-latitude']);
  const rawLon=Number(req.headers['x-vercel-ip-longitude']);
  const valid=Number.isFinite(rawLat)&&Number.isFinite(rawLon)&&
    rawLat>=-90&&rawLat<=90&&rawLon>=-180&&rawLon<=180&&
    typeof req.headers['x-vercel-ip-latitude']==='string'&&
    typeof req.headers['x-vercel-ip-longitude']==='string';
  const lat=valid?rawLat:42.4304;
  const lon=valid?rawLon:18.6967;
  const rawCity=String(req.headers['x-vercel-ip-city']||'');
  let city='Tivat';
  if(valid&&rawCity){
    try {city=decodeURIComponent(rawCity).slice(0,80);}catch {city=rawCity.slice(0,80);}
  }else if(valid){city='Približna lokacija';}
  const rawZone=String(req.headers['x-vercel-ip-timezone']||'');
  let timezone='Europe/Podgorica';
  if(valid&&rawZone){
    try {new Intl.DateTimeFormat('en',{timeZone:rawZone});timezone=rawZone;}catch {}
  }
  return res.status(200).json({latitude:lat,longitude:lon,city,timezone,source:valid?'approximate-ip':'fallback-tivat'});
};