// Aggregate GA4 Ecommerce purchases → Item name CSV; never imports visitor-level data.
function parseRows(text) {
  const out=[]; let cell="",row=[],quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){
      if(ch==='"'&&text[i+1]==='"'){cell+='"';i++;}
      else if(ch==='"')quoted=false;else cell+=ch;
    }else if(ch==='"')quoted=true;
    else if(ch===','){row.push(cell);cell="";}
    else if(ch==='\n'||ch==='\r'){
      if(ch==='\r'&&text[i+1]==='\n')i++;
      row.push(cell);if(row.some(v=>v.trim()))out.push(row);row=[];cell="";
    }else cell+=ch;
  }
  if(quoted)throw Error("Unclosed CSV quote.");
  row.push(cell);if(row.some(v=>v.trim()))out.push(row);
  return out;
}
const date=(raw)=>{
  const s=String(raw||"").trim();
  if(!/^\d{8}$/.test(s))return null;
  const iso=s.slice(0,4)+"-"+s.slice(4,6)+"-"+s.slice(6,8);
  return Number.isFinite(Date.parse(iso+"T00:00:00Z"))?iso:null;
};
export function parseGa4ItemsCsv(csv,uploadedAt=new Date().toISOString()){
  if(typeof csv!=="string"||csv.length>2*1024*1024)throw Error("GA4 CSV must be smaller than 2MB.");
  const rows=parseRows(csv.replace(/^\uFEFF/,""));
  const header=rows.findIndex(r=>r[0]?.trim()==="Item name");
  const expected=["Item name","Items viewed","Items added to cart","Items purchased","Item revenue"];
  if(header<0||expected.some((name,i)=>rows[header][i]?.trim()!==name))throw Error("Expected GA4 Ecommerce purchases → Item name CSV.");
  const starts=rows.find(r=>r[0]?.startsWith("# Start date:"))?.[0]?.split(":").slice(1).join(":");
  const ends=rows.find(r=>r[0]?.startsWith("# End date:"))?.[0]?.split(":").slice(1).join(":");
  const start=date(starts),end=date(ends);
  if(!start||!end||start>end)throw Error("Missing or invalid reporting period.");
  const items=[],names=new Set();
  for(const row of rows.slice(header+1)){
    const name=row[0]?.trim();
    if(!name||name.startsWith("#"))continue;
    if(names.has(name.toLocaleLowerCase()))throw Error("Duplicate item: "+name);
    names.add(name.toLocaleLowerCase());
    const values=row.slice(1,5).map(Number);
    if(values.length!==4||values.some(v=>!Number.isFinite(v)||v<0)||
       values.slice(0,3).some(v=>!Number.isInteger(v)))throw Error("Invalid values for "+name);
    items.push({name,views:values[0],adds:values[1],purchased:values[2],revenue:values[3]});
  }
  if(!items.length)throw Error("No item rows found.");
  return {version:1,start,end,uploadedAt,items};
}
