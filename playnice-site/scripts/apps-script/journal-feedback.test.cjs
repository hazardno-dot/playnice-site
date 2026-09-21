const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const handler = fs.readFileSync(require('node:path').join(__dirname, 'journal-feedback.gs'), 'utf8');
const rows=[Array(12).fill('header')];
let held=false, busy=false, writes=0;
const sheet={
 getLastRow:()=>rows.length,
 insertRowBefore:r=>{assert(held);rows.splice(r-1,0,[]);},
 getRange:(r,c,n=1,w=1)=>({
  getValues:()=>rows.slice(r-1,r-1+n).map(row=>row.slice(c-1,c-1+w)),
  getValue:()=>rows[r-1][c-1],
  setValues:values=>{assert(held);writes++;values.forEach((row,i)=>row.forEach((v,j)=>rows[r-1+i][c-1+j]=v));}
 })
};
const ctx={Date, String, Error, Utilities:{formatDate:()=> '9/21/2026'},Session:{getScriptTimeZone:()=> 'UTC'},SpreadsheetApp:{flush(){}},Logger:{log(){}},refreshJournalAnalytics(){assert(held);},jsonResponse:x=>x,LockService:{getScriptLock:()=>({tryLock:()=>{if(busy)return false; held=true;return true;},releaseLock:()=>{held=false;}})}};
vm.createContext(ctx);vm.runInContext(handler,ctx);
const send=data=>ctx.handleJournalFeedback({getSheetByName:()=>sheet},{article:'21',deviceId:'d',feedbackId:'journal_d_21',vote:'up',...data});
assert.equal(send({operation:'vote',note:'UNSENT DRAFT'}).status,'ok');assert.equal(rows[1][4],'');
assert.equal(send({operation:'note',note:'Keep this'}).action,'updated');
assert.equal(send({operation:'vote',vote:'down'}).status,'ok');assert.equal(rows[1][4],'Keep this');assert.equal(rows[1][3],'down');assert.equal(rows.length,2);
send({operation:'vote',vote:'down'});assert.equal(rows.length,2);
send({note:''});assert.equal(rows[1][4],'Keep this'); // legacy empty note preserves comment
send({operation:'note',note:'Replacement'});assert.equal(rows[1][4],'Replacement');
const before=writes;
for(const data of [{vote:'bad'},{deviceId:''},{article:''},{operation:'bad'},{operation:'note',note:' '},{operation:'note',note:'a'.repeat(2001)},{feedbackId:'wrong'}]) assert.equal(send(data).status,'error');
assert.equal(writes,before);busy=true;assert.equal(send({operation:'vote'}).status,'busy');assert.equal(writes,before);busy=false;
send({operation:'note',note:'=1+1'});assert.equal(rows[1][4],"'=1+1");assert.equal(held,false);
console.log('PASS: create/update, draft exclusion, note preservation, repeat vote, legacy compatibility, note replacement, invalid payloads, busy lock, literal note and lock release.');
