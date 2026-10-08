// GA4 Events: Event name export, aggregate-only. No individual visitor data.
const EXPECTED = ["Event name", "Event count", "Total users", "Event count per active user", "Total revenue"];
export const GA4_EVENTS = ["page_view", "session_start", "view_item", "add_to_cart", "view_cart", "begin_checkout", "purchase"];
function csvRows(input) {
  const rows=[]; let row=[], field="", quoted=false;
  for (let i=0;i<input.length;i++) {
    const ch=input[i];
    if (quoted) {
      if(ch==='"'&&input[i+1]==='"'){field+='"';i++;}
      else if(ch==='"')quoted=false;
      else field+=ch;
    } else if(ch==='"') quoted=true;
    else if(ch===","){row.push(field);field="";}
    else if(ch==="\n"||ch==="\r"){if(ch==="\r"&&input[i+1]==="\n")i++;row.push(field);if(row.some(v=>v.trim()))rows.push(row);row=[];field="";}
    else field+=ch;
  }
  if(quoted)throw Error("Incomplete quoted CSV field.");
  row.push(field);if(row.some(v=>v.trim()))rows.push(row);
  return rows;
}
const dateStamp=(v)=>/^\d{8}$/.test(v)?`${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`:"";
export function parseGa4EventCsv(csv, uploadedAt=new Date().toISOString()) {
  if(typeof csv!=="string"||csv.length>1024*1024)throw Error("Please select a GA4 CSV smaller than 1 MB.");
  const rows=csvRows(csv.replace(/^\uFEFF/,""));
  const header=rows.findIndex(r=>r[0]?.trim()==="Event name");
  if(header<0||EXPECTED.some((col,i)=>rows[header][i]?.trim()!==col))
    throw Error("Expected Google Analytics Events → Event name CSV export.");
  const start=dateStamp(rows.find(r=>r[0]?.trim()==="# Start date:")?.[1]?.trim()||rows.find(r=>r[0]?.startsWith("# Start date:"))?.[0]?.split(":")[1]?.trim()||"");
  const end=dateStamp(rows.find(r=>r[0]?.trim()==="# End date:")?.[1]?.trim()||rows.find(r=>r[0]?.startsWith("# End date:"))?.[0]?.split(":")[1]?.trim()||"");
  if(!start||!end||start>end)throw Error("The export needs valid Start date and End date.");
  const events={};
  for(const cells of rows.slice(header+1)){
    const name=cells[0]?.trim();
    if(!name||name.startsWith("#"))continue;
    const count=Number(cells[1]), users=Number(cells[2]), revenue=Number(cells[4]);
    if(![count,users,revenue].every(Number.isFinite)||count<0||users<0||revenue<0||!Number.isInteger(count)||!Number.isInteger(users))
      throw Error(`Invalid GA4 numbers for ${name}.`);
    if(events[name])throw Error(`Duplicate event: ${name}`);
    events[name]={count,users,revenue};
  }
  if(!events.page_view||!events.session_start)throw Error("The file is missing basic GA4 events.");
  return {version:1,start,end,uploadedAt,events};
}
