const round=n=>Math.round((n+Number.EPSILON)*100)/100;
export const CI_NAME='ซีไอ เพอร์เฟค แคร์';
export const CI_TERMS=[
 'ผลประโยชน์กรณีเสียชีวิตและโรคร้ายแรงระยะรุนแรง หักผลประโยชน์ระยะเริ่มต้นและ/หรือระยะกลางที่ได้รับแล้ว',
 'ผลประโยชน์โรคร้ายแรงระยะกลาง หักผลประโยชน์ระยะเริ่มต้นของโรคร้ายแรงเดียวกันที่ได้รับแล้ว (ถ้ามี)',
 'ผลประโยชน์เพิ่มเติมการผ่าตัดขยายหลอดเลือดแดงหัวใจและโรคแทรกซ้อนของเบาหวาน จ่ายแต่ละข้อเพียง 1 ครั้งตลอดอายุสัญญา'
];
export function ciBenefits(sum){
 return [['กรณีเสียชีวิต',1],['โรคร้ายแรง ระยะเริ่มต้น',.25],['โรคร้ายแรง ระยะกลาง',.5],['โรคร้ายแรง ระยะรุนแรง',1],['เพิ่มเติม: ผ่าตัดขยายหลอดเลือดแดงหัวใจ',.1],['เพิ่มเติม: โรคแทรกซ้อนของเบาหวาน',.1]].map(([label,pct])=>({label,pct,amount:round(sum*pct)}));
}
export function ciQuote(data,input,age=Number(input.age)){
 const sum=Number(input.ciSum);
 if(!Number.isFinite(sum)||sum<=0||sum>1e12)throw Error(`${CI_NAME}: กรุณาระบุทุนประกันมากกว่า 0 และไม่เกิน 1,000,000,000,000 บาท`);
 if(Math.abs(sum*100-Math.round(sum*100))>.00001)throw Error(`${CI_NAME}: กรุณาระบุทุนประกันไม่เกินทศนิยม 2 ตำแหน่ง`);
 if(!['male','female'].includes(input.gender))throw Error('กรุณาเลือกเพศ');
 if(!data||!Array.isArray(data.rates))throw Error(`โหลดอัตราเบี้ย ${CI_NAME} ไม่สำเร็จ`);
 const index=data.frequencies.indexOf(input.frequency);
 if(index<0)throw Error('กรุณาเลือกงวดชำระเบี้ย');
 if(!Number.isInteger(age)||age<0||age>data.renewalMaxAge)return null;
 const rate=data.rates[age]?.[index+(input.gender==='female'?4:0)];
 if(!(rate>0))return null;
 const premium=round(sum*rate/data.ratePer);
 if(premium<.01)throw Error(`${CI_NAME}: ทุนประกันน้อยเกินกว่าจะคำนวณเบี้ยเป็นทศนิยม 2 ตำแหน่ง`);
 return {label:CI_NAME,sum,rate,premium,detail:`ทุนประกัน ${sum.toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2})} บาท`,source:data.source,benefits:ciBenefits(sum)};
}
export function ciSummary(ci,frequency){
 const money=n=>n.toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});
 return ['',ci.label,ci.detail,`เบี้ย${frequency.label} ${money(ci.premium)} บาท/งวด`,`เบี้ยรวมต่อปี ${money(ci.annual)} บาท`,...ci.benefits.map(b=>`${b.label}: ${money(b.amount)} บาท (${b.pct*100}% ของทุน ณ วันเริ่มสัญญา)`),...CI_TERMS,'ตารางอัตราอายุ 66–84 ปีสำหรับต่ออายุเท่านั้น หลังอายุ 84 ปีไม่มีอัตราในภาพที่ให้ไว้'].join('\n');
}
