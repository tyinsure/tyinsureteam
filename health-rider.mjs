const round=n=>Math.round((n+Number.EPSILON)*100)/100;
export const HEALTH_NAMES={dhealth:'D Health Lite',elite:'Elite Health Plus',care:'Care Plus'};
export const HEALTH_AREAS=['เฉพาะประเทศไทย','ทวีปเอเชีย','ทั่วโลกยกเว้นสหรัฐอเมริกา','ทั่วโลก'];
export function healthOptions(benefit,type){
 if(type==='none')return [{id:'ded0',label:'ไม่มีความรับผิดชอบส่วนแรกและส่วนร่วมจ่าย'}];
 if(type==='copay')return [{id:'copay20',label:'ส่วนร่วมจ่าย 20% · ไม่มีความรับผิดส่วนแรก'},{id:'copay10',label:'ส่วนร่วมจ่าย 10% · ไม่มีความรับผิดส่วนแรก'}];
 if(type==='deductible')return (String(benefit)==='1000000'?[20000,50000]:[30000,50000,100000]).map(n=>({id:'ded'+n,label:`ความรับผิดส่วนแรก ${n.toLocaleString('th-TH')} บาท · ไม่มีส่วนร่วมจ่าย`}));
 return [];
}
export function healthQuote(data,input,age=Number(input.age)){
 if(!input.healthProduct)return null;
 if(!Number.isInteger(age)||age<0||age>98)return null;
 if(!['male','female'].includes(input.gender))throw Error('กรุณาเลือกเพศ');
 let premium,label,detail;
 if(input.healthProduct==='dhealth'){
  const opts=healthOptions(input.healthBenefit,input.healthType),opt=opts.find(o=>o.id===(input.healthType==='none'?'ded0':input.healthOption));
  if(!opt)throw Error('กรุณาเลือกความรับผิดส่วนแรกหรือส่วนร่วมจ่าย');
  const columns=String(input.healthBenefit)==='1000000'?['ded0','ded20000','ded50000','copay20','copay10']:['ded0','ded30000','ded50000','ded100000','copay20','copay10'];
  const rows=data.dhealth[input.healthBenefit]?.[input.frequency];if(!rows)throw Error('ไม่พบแผน D Health Lite ที่เลือก');
  const row=rows.find(r=>age>=r.min&&age<=r.max);premium=row?.values[columns.indexOf(opt.id)*2+(input.gender==='female'?1:0)]??null;
  label=HEALTH_NAMES.dhealth;detail=`วงเงิน ${Number(input.healthBenefit).toLocaleString('th-TH')} บาท · ${opt.label}`;
 }else if(input.healthProduct==='care'){
  const conditions={both:'ไตวายเรื้อรังและมะเร็ง',kidney:'เฉพาะไตวายเรื้อรัง',cancer:'เฉพาะโรคมะเร็ง'};
  const benefit=Number(input.careBenefit);if(![1000000,5000000].includes(benefit)||!conditions[input.careCondition])throw Error('กรุณาเลือกวงเงินและความคุ้มครอง Care Plus');
  premium=data.care?.[input.careCondition]?.[input.frequency]?.[age]?.[(benefit===1000000?0:2)+(input.gender==='female'?1:0)]??null;
  label=HEALTH_NAMES.care;detail=`วงเงิน ${benefit.toLocaleString('th-TH')} บาท · ${conditions[input.careCondition]}`;
 }else if(input.healthProduct==='elite'){
  const plan=Number(input.healthPlan),area=Number(input.healthArea);
  if(!Number.isInteger(plan)||plan<1||plan>4||!Number.isInteger(area)||area<0||area>3)throw Error('กรุณาเลือกแผนและพื้นที่คุ้มครอง');
  premium=data.elite[input.frequency]?.[age]?.[(plan-1)*4+area]??null;
  label=HEALTH_NAMES.elite;detail=`แผน ${plan} · ${HEALTH_AREAS[area]}`;
 }else throw Error('กรุณาเลือกแผนประกันสุขภาพ');
 return {label,detail,premium,source:data.sources[input.healthProduct],renewalAge:input.healthProduct==='care'?81:91,occupation:'1–2'};
}
export function annualTotalPremium(row,r){
 if(row.age===99)return 0;
 const values=[row.pay,...(r.rider?[row.riderPremium]:[]),...(r.health?[row.healthPremium]:[]),...(r.care?[row.carePremium]:[])];
 return values.some(v=>v==null)?null:round(values.reduce((sum,v)=>sum+v,0));
}
export function addHealthRider(result,data,input){
 const count=result.frequency.payments;
 let r=result;
 const selected=[...(input.healthProduct?[['health',input]]:[]),...(input.careEnabled?[['care',{...input,healthProduct:'care'}]]:[])];
 for(const [key,quoteInput] of selected){
  const quote=healthQuote(data,quoteInput);if(quote.premium===null)throw Error(`ไม่มีอัตราเบี้ย ${quote.label} สำหรับอายุและตัวเลือกนี้ใน PDF กรุณาเปลี่ยนตัวเลือก`);
  r={...r,[key]:{...quote,annual:round(quote.premium*count)},schedule:r.schedule.map(row=>{const q=healthQuote(data,quoteInput,row.age);return {...row,[key+'Premium']:row.age===99?0:q?.premium==null?null:round(q.premium*count)};})};
 }
 if(!selected.length)return {...result,schedule:result.schedule.map(row=>({...row,totalPremium:annualTotalPremium(row,result)}))};
 const premium=round(r.premium+(r.rider?.premium??0)+(r.health?.premium??0)+(r.care?.premium??0));
 return {...r,schedule:r.schedule.map(row=>({...row,totalPremium:annualTotalPremium(row,r)})),combinedFirstYearPremium:premium,combinedFirstYearAnnual:round(premium*count)};
}
export function healthReportResult(r){
 const extras=[r.health,r.care].filter(Boolean);if(!extras.length)return r;
 const description=extras.map(x=>`${x.label} · ${x.detail}`).join(' + ');
 return {...r,plan:{...r.plan,label:`${r.plan.label} + ${description}`},rider:{name:`${description}${r.rider?' + PA '+r.rider.name:''}`,occupation:'1–2',premium:round(extras.reduce((n,x)=>n+x.premium,0)+(r.rider?.premium??0)),holiday:false},schedule:r.schedule.map(row=>{
  const premiums=[...(r.health?[row.healthPremium]:[]),...(r.care?[row.carePremium]:[]),...(r.rider?[row.riderPremium]:[])];
  return {...row,riderPremium:premiums.some(v=>v===null)?null:round(premiums.reduce((n,v)=>n+v,0))};
 })};
}

// Validate selected, successfully quoted riders; health cover alone is insufficient.
export function validateMainRiders(result){
 if(result.plan.family==='wholelife50000'){
  const annual=round((result.health?.annual??0)+(result.care?.annual??0)+(result.rider?.annualPremium??0));
  if(annual<5000)throw Error('เบี้ยสัญญาเพิ่มเติมไม่ครบ 5,000บาท กรุณาเพิ่มให้ครบ');
  return;
 }

 if(result.plan.requiresPA&&!result.rider){
  throw Error('สมาร์ท โพรเทคชั่น 99/99 (ทุน50,001–199,999) ต้องเลือกแผน PA');
 }
 if(result.plan.family!=='smart9999'&&!result.rider&&!result.care){
  throw Error('สมาร์ท โพรเทคชั่น 99/20 (ชำระ 20 ปี) ต้องเลือก PA หรือ Care Plus หรือประกันโรคร้ายแรง อย่างน้อย 1 แผน');
 }
}
