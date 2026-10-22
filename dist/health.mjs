import {dailyBenefits,DAILY_TERMS,dailySummary} from './daily-compensation.mjs';
import {CI_TERMS,ciSummary} from './ci-perfect-care.mjs';
import {healthOptions,addHealthRider,healthReportResult,validateMainRiders} from './health-rider.mjs';
import {PA_PLANS,paAnnualPremium} from './pa-easy.mjs';
import {mountCustomerSummary} from './summary-controller.mjs';
import {legacySummary} from './health-calculator.mjs';
import {calculateLegacy} from './health-calculator.mjs';
import {createExcelReport} from './health-excel-export.mjs';
import {createPDFReport} from './health-pdf-export.mjs';
const $=id=>document.getElementById(id),money=n=>n.toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});
let healthData,data,mode='sum',result=null,dailyBenefit=500;
const input=()=>({mainPlan:$('main-plan').value,mainAtLeast30Days:$('main-infant').checked,age:$('age').value,gender:document.querySelector('input[name="gender"]:checked')?.value,amount:$('amount').value,frequency:$('frequency').value,mode,healthProduct:$('health-product').value,healthBenefit:$('health-benefit').value,healthType:$('health-type').value,healthOption:$('health-option').value,healthPlan:$('health-plan').value,healthArea:$('health-area').value,dailyEnabled:$('daily-enabled').checked,dailyBenefit,careEnabled:$('care-enabled').checked,careBenefit:$('care-benefit').value,careCondition:$('care-condition').value,ciEnabled:$('ci-enabled').checked,ciSum:$('ci-sum').value,paEnabled:$('pa-enabled').checked,paPlan:$('pa-plan').value,paOccupation:'1',paHoliday:false,paAtLeast30Days:$('pa-infant').checked});
const summary=mountCustomerSummary({getResult:()=>result,getInput:input,refresh:render,createSummary:r=>legacySummary(r)+[r.health,r.care].filter(Boolean).map(x=>`\n\n${x.label}\n${x.detail}\nกลุ่มอาชีพ 1–2\nเบี้ย${r.frequency.label} ${money(x.premium)} บาท/งวด\nเบี้ยปรับตามอายุ อัตราอายุ ${x.renewalAge}–98 ปีสำหรับต่ออายุเท่านั้น`).join('')+(r.daily?'\n'+dailySummary(r.daily,r.frequency):'')+(r.ci?'\n'+ciSummary(r.ci,r.frequency):'')+((r.health||r.daily||r.care||r.ci)?`\n\nเบี้ยหลักและสัญญาเพิ่มเติมที่เลือกทั้งหมด ${money(r.combinedFirstYearPremium)} บาท/งวด`:'' )});
function updateRiderControls(){
 const enabled=$('pa-enabled').checked,age=Number($('age').value),plan=PA_PLANS.find(p=>p.id===Number($('pa-plan').value));
 $('pa-controls').hidden=!enabled;$('pa-infant-label').hidden=age!==0;
 for(const option of $('pa-plan').options){const price=paAnnualPremium(age,Number(option.value));option.disabled=price===null;option.textContent=`แผน ${option.value}${price===null?' · ไม่มีอัตราสำหรับอายุนี้':''}`;}
 $('pa-premium-heading').hidden=!enabled;$('pa-table-note').hidden=!enabled;$('pa-cost').hidden=!enabled;
 document.body.classList.toggle('has-pa-rider',enabled);
 if(enabled&&plan)$('pa-benefits').innerHTML=`<p><strong>วงเงินสูงสุดตามเหตุการณ์ · ${plan.name}</strong></p><dl>${[
 ['อุบัติเหตุที่ไม่ใช่ขับขี่/โดยสารรถจักรยานยนต์',plan.accident],['ฆาตกรรมหรือถูกทำร้ายร่างกาย',plan.assault],['ขับขี่/โดยสารรถจักรยานยนต์',plan.motorcycle],['อุบัติเหตุสาธารณะ',plan.publicAccident],['ค่ารักษาพยาบาลต่ออุบัติเหตุ',plan.medical]
 ].map(([name,value])=>`<div><dt>${name}</dt><dd>${money(value)} บาท</dd></div>`).join('')}</dl>`;
}
function updateHealthControls(){
 const dailyEnabled=$('daily-enabled').checked;
 $('daily-controls').hidden=!dailyEnabled;$('daily-cost').hidden=!dailyEnabled;$('daily-premium-heading').hidden=!dailyEnabled;
 document.body.classList.toggle('has-daily-rider',dailyEnabled);
 for(const benefit of [500,1000]){const button=$('daily-'+benefit);button.disabled=!dailyEnabled;button.classList.toggle('active',dailyBenefit===benefit);button.setAttribute('aria-pressed',String(dailyBenefit===benefit));}
 if(dailyEnabled)$('daily-benefits').innerHTML='<p><strong>ตัวอย่างผลประโยชน์รวมต่อวัน</strong></p><dl>'+dailyBenefits(dailyBenefit).map(b=>'<div><dt>'+b.label+'</dt><dd>'+money(b.amount)+' บาท/วัน</dd></div>').join('')+'</dl><details><summary>เงื่อนไขความคุ้มครอง</summary>'+DAILY_TERMS.map(t=>'<small>'+t+'</small>').join('')+'</details>';
 else $('daily-benefits').replaceChildren();
 const ciEnabled=$('ci-enabled').checked;
 $('ci-controls').hidden=!ciEnabled;$('ci-sum').disabled=!ciEnabled;$('ci-cost').hidden=!ciEnabled;$('ci-premium-heading').hidden=!ciEnabled;
 document.body.classList.toggle('has-ci-rider',ciEnabled);
 const product=$('health-product').value,enabled=!!product;
 document.body.classList.toggle('has-health-rider',enabled||$('care-enabled').checked);$('health-controls').hidden=!enabled;$('dhealth-controls').hidden=product!=='dhealth';$('elite-controls').hidden=product!=='elite';const careEnabled=$('care-enabled').checked;$('care-controls').hidden=!careEnabled;$('care-cost').hidden=!careEnabled;$('care-premium-heading').hidden=!careEnabled;
 $('health-cost').hidden=!enabled;$('health-premium-heading').hidden=!enabled;$('health-table-note').hidden=!(enabled||careEnabled||ciEnabled);
 $('health-option-field').hidden=product!=='dhealth'||$('health-type').value==='none';
 $('health-option').disabled=$('health-type').value==='none';
 if(product==='dhealth'){
  const options=healthOptions($('health-benefit').value,$('health-type').value),selected=$('health-option').value;
  $('health-option').innerHTML=options.map(o=>`<option value="${o.id}">${o.label}</option>`).join('');
  $('health-option').value=options.some(o=>o.id===selected)?selected:options[0].id;
 }

}
function render(){
 const fixed=$('main-plan').value==='wholelife50000';
 if(fixed){mode='sum';$('amount').value='50000';}
 $('amount').disabled=fixed;$('mode-premium').disabled=fixed;
 for(const m of ['sum','premium']){$('mode-'+m).classList.toggle('active',m===mode);$('mode-'+m).setAttribute('aria-selected',String(m===mode));}
 const smart=$('main-plan').value.startsWith('smart9999');
 $('age').max=smart||fixed?'90':'70';$('main-infant-label').hidden=!smart||Number($('age').value)!==0;
 $('main-age-hint').textContent=fixed?'อัตราในภาพรองรับอายุ 0–90 ปี':smart?'อัตราใน PDF อายุ 30 วัน–90 ปี':'ตารางอัตราเบี้ยรองรับอายุ 0–70 ปี';
 $('main-plan-hint').textContent=smart?($('main-plan').value==='smart9999-small'?'ชำระเบี้ยถึงอายุ 99 ปี · ทุน 50,001–199,999 บาท · ต้องเลือกแผน PA':'ชำระเบี้ยถึงอายุ 99 ปี · เลือกอัตราตามทุนจริงใน PDF (ถึงน้อยกว่า 10 ล้านบาท)'):'ชำระเบี้ย 20 ปี คุ้มครองถึงอายุ 99 ปี · ต้องเลือก PA หรือ Care Plus หรือประกันโรคร้ายแรง อย่างน้อย 1 แผน';
 $('main-plan-intro').textContent=smart?'เมืองไทย สมาร์ท โพรเทคชั่น 99/99 · ชำระเบี้ยและคุ้มครองถึงอายุ 99 ปี':'เมืองไทย สมาร์ท โพรเทคชั่น 99/20 · ชำระเบี้ย 20 ปี คุ้มครองถึงอายุ 99 ปี';
 $('main-pay-label').textContent=smart?'ชำระเบี้ยถึงอายุ 99 ปี':'ชำระเบี้ย 20 ปี';$('main-plan-badge').textContent=smart?'99/99':'99/20';
 $('main-benefit-note').innerHTML=smart?'กรณีเสียชีวิต รับจำนวนที่สูงที่สุดระหว่าง <strong>ทุนประกัน 100% · มูลค่าเวนคืนขณะนั้น · 101% ของเบี้ยสะสมที่ชำระแล้ว</strong>':'กรณีเสียชีวิต รับจำนวนที่สูงที่สุดระหว่าง <strong>ทุนประกัน 100% · มูลค่าเวนคืนขณะนั้น · เบี้ยสะสมที่ชำระแล้ว</strong>';
 $('main-coverage-note').textContent=smart?'ประกันชีวิตในตาราง = ค่าสูงกว่าระหว่างทุนประกันกับ 101% ของเบี้ยสะสม ยังไม่รวมการเปรียบเทียบมูลค่าเวนคืน เงินครบสัญญา = ค่าสูงกว่าระหว่างทุนกับ 101% ของเบี้ยที่ชำระทั้งหมด':'ความคุ้มครองขั้นต่ำ = ค่าสูงกว่าระหว่างทุนประกันกับเบี้ยสะสม ยังไม่รวมการเปรียบเทียบมูลค่าเวนคืน';
 if(fixed){
  $('main-plan-hint').textContent='ทุนคงที่ 50,000 บาท · ชำระเบี้ยถึงอายุ 99 ปี · เบี้ยสัญญาเพิ่มเติมรวมต่อปีอย่างน้อย 5,000 บาท';
  $('main-plan-intro').textContent='คุ้มครองตลอดชีพ 99/99 · ทุนประกัน 50,000 บาท';
  $('main-pay-label').textContent='ชำระเบี้ยถึงอายุ 99 ปี';$('main-plan-badge').textContent='99/99';
  $('main-benefit-note').textContent='ความคุ้มครองชีวิต 100% ของทุนประกัน และเงินครบสัญญา 100% ของทุนประกัน ตามภาพที่แนบ';
  $('main-coverage-note').textContent='ประกันชีวิต 50,000 บาท และเงินครบสัญญาอายุ 99 ปี 50,000 บาท ตามภาพผลประโยชน์ที่แนบ';
 }
 updateHealthControls();
 updateRiderControls();
 const frequency=data.frequencies.find(f=>f.id===$('frequency').value);
 $('amount-label').innerHTML=mode==='sum'?'ทุนประกัน <span>บาท</span>':`เบี้ยประกัน${frequency.label} <span>บาท/งวด</span>`;
 $('amount-hint').textContent=fixed?'ทุนคงที่ 50,000 บาท ไม่สามารถแก้ไขได้':mode==='sum'?(smart?($('main-plan').value==='smart9999-small'?'ทุน 50,001–199,999 บาท':'ทุน 200,000 ถึงน้อยกว่า 10,000,000 บาท ตามอัตราใน PDF'):'ทุนประกันขั้นต่ำ 200,000 บาท'):'เบี้ยที่กรอกเป็นสัญญาหลัก ไม่รวมสัญญาเพิ่มเติม ทุนแสดงทศนิยม 2 ตำแหน่ง';
 try{
  const r=addHealthRider(calculateLegacy(data,input()),healthData,input());validateMainRiders(r);result=r;$('error').hidden=true;$('legacy-results').classList.remove('invalid');
  $('headline-label').textContent=mode==='sum'?`${r.rider||r.health||r.daily||r.care||r.ci?'เบี้ยสัญญาหลัก':'เบี้ยประกัน'}${r.frequency.label}`:'ทุนประกันที่คำนวณได้';
  $('headline-value').textContent=money(mode==='sum'?r.premium:r.sum);$('headline-unit').textContent=mode==='sum'?'บาท/งวด':'บาท';
  $('complement-label').textContent=mode==='sum'?'ทุนประกัน':`เบี้ยสัญญาหลัก${r.frequency.label}`;$('complement-value').textContent=`${money(mode==='sum'?r.sum:r.premium)} บาท`;
  $('rate-detail').textContent=`อัตรา${r.frequency.label} ${r.rate.toFixed(r.frequency.id==='monthly'?3:2)} บาท ต่อทุน 1,000 บาท${r.rateBand?` · ช่วงทุน ${money(r.rateBand.min)} ถึงน้อยกว่า ${money(r.rateBand.maxExclusive)} บาท · ${r.rateSource}`:''}`;
  if(r.rider){$('pa-base-annual').textContent=`${money(r.premium)} บาท/งวด`;$('pa-annual').textContent=`${money(r.rider.premium)} บาท/งวด`;$('pa-combined').textContent=`${money(r.premium+r.rider.premium)} บาท/งวด`;$('pa-cost-title').textContent=`เบี้ยปีแรก • ชำระ${r.frequency.label}`;}
  if(r.health){$('health-selection').textContent=`${r.health.label} · ${r.health.detail}`;$('health-premium').textContent=`${money(r.health.premium)} บาท/งวด (${r.frequency.label})`;$('health-annual').textContent=`${money(r.health.annual)} บาท/ปี`;$('health-combined').textContent=`${money(r.combinedFirstYearPremium)} บาท/งวด`;}
  if(r.daily){$('daily-selection').textContent=r.daily.detail;$('daily-premium').textContent=money(r.daily.premium)+' บาท/งวด ('+r.frequency.label+')';$('daily-annual').textContent=money(r.daily.annual)+' บาท/ปี';$('daily-combined').textContent=money(r.combinedFirstYearPremium)+' บาท/งวด';}
  if(r.ci){
   $('ci-selection').textContent=r.ci.detail;$('ci-premium').textContent=money(r.ci.premium)+' บาท/งวด ('+r.frequency.label+')';$('ci-annual').textContent=money(r.ci.annual)+' บาท/ปี';$('ci-combined').textContent=money(r.combinedFirstYearPremium)+' บาท/งวด';
   $('ci-benefits').innerHTML='<p><strong>ผลประโยชน์ตามทุน ณ วันเริ่มสัญญา</strong></p><dl>'+r.ci.benefits.map(b=>'<div><dt>'+b.label+' · '+b.pct*100+'%</dt><dd>'+money(b.amount)+' บาท</dd></div>').join('')+'</dl>'+CI_TERMS.map(t=>'<small>'+t+'</small>').join('');
  }
  if(r.care){$('care-selection').textContent=r.care.detail;$('care-premium').textContent=`${money(r.care.premium)} บาท/งวด (${r.frequency.label})`;$('care-annual').textContent=`${money(r.care.annual)} บาท/ปี`;$('care-combined').textContent=`${money(r.combinedFirstYearPremium)} บาท/งวด`;}
  $('initial-coverage').textContent=money(r.initialCoverage);$('total-paid').textContent=money(r.totalPaid);$('maturity-value').textContent=money(r.maturityAmount);
  $('pay-note').textContent=`บาท · สัญญาหลัก · ${r.payYears*r.frequency.payments} งวด ใน ${r.payYears} ปี`;
  $('start-age').textContent=`${r.age} ปี`;$('paid-age').textContent=`${r.age+r.payYears} ปี`;
  $('main-journey-title').textContent=`ชำระ ${r.payYears} ปี คุ้มครองถึงอายุ 99 ปี`;$('main-paid-label').textContent=`ชำระครบ ${r.payYears} ปี`;
  $('calculation-note').textContent=`ชำระ${r.frequency.label} ${money(r.premium)} บาท/งวด · รวมต่อปี ${money(r.annualPaid)} บาท · ${mode==='premium'?'ทุนคำนวณตามเบี้ยที่กรอก':(fixed?'ใช้อัตรารายงวดจากภาพที่แนบ':smart?'ใช้อัตราตามช่วงทุนใน PDF':'ไม่มีส่วนลดอัตราเบี้ยรายปี')}`;
  $('schedule-description').textContent=`${r.gender==='male'?'ชาย':'หญิง'} อายุเริ่ม ${r.age} ปี · ทุน ${money(r.sum)} บาท · ชำระ${r.frequency.label}`;
  $('schedule-body').innerHTML=r.schedule.map(row=>`<tr class="${[1,r.payYears].includes(row.policyYear)||row.age===99?'milestone':''}"><td><span class="age-number">${row.age}</span><span class="phase">${row.policyYear===1?'เริ่มคุ้มครอง':row.age===99?'ครบสัญญา':row.policyYear===r.payYears?'ปีสุดท้ายที่ชำระเบี้ย':'ปีกรมธรรม์'}</span></td><td>${row.pay?money(row.pay):'—'}</td>${r.health?`<td>${row.healthPremium===null?'—':row.healthPremium?money(row.healthPremium):'—'}</td>`:''}${r.daily?`<td>${row.dailyPremium?money(row.dailyPremium):'—'}</td>`:''}${r.care?`<td>${row.carePremium===null||!row.carePremium?'—':money(row.carePremium)}</td>`:''}${r.ci?`<td>${row.ciPremium===null?'—':money(row.ciPremium)}</td>`:''}${r.rider?`<td class="rider-premium-value">${row.riderPremium===null?'—':money(row.riderPremium)}</td>`:''}<td class="total-premium-value">${row.totalPremium===null?'—':money(row.totalPremium)}</td><td class="coverage-value">${row.coverage?money(row.coverage):'—'}</td><td class="pension-value">${row.maturity?money(row.maturity):'—'}</td></tr>`).join('');
  $('row-count').textContent=`อายุ ${r.age}–99 ปี · ${r.schedule.length} แถว`;
  $('excel').disabled=false;$('pdf').disabled=false;$('print').disabled=false;summary.update();
 }catch(e){
  result=null;$('error').hidden=false;$('error').textContent=e.message;$('legacy-results').classList.add('invalid');
  for(const id of ['headline-value','complement-value','initial-coverage','total-paid','maturity-value','pa-base-annual','pa-annual','pa-combined','health-premium','health-annual','health-combined','health-selection','care-selection','care-premium','care-annual','care-combined','ci-selection','ci-premium','ci-annual','ci-combined','daily-selection','daily-premium','daily-annual','daily-combined'])$(id).textContent='—';
  $('ci-benefits').replaceChildren();
  $('rate-detail').textContent='';$('calculation-note').textContent='กรอกข้อมูลให้ถูกต้องเพื่อดูผลคำนวณ';$('schedule-body').replaceChildren();$('row-count').textContent='ยังไม่มีข้อมูล';$('schedule-description').textContent='';
  for(const id of ['excel','pdf','print'])$(id).disabled=true;summary.update();
 }
}
async function download(kind){
 render();if(!result)return;
 const r=result,button=$(kind),label=button.textContent;button.disabled=true;button.textContent='กำลังสร้างไฟล์…';
 try{
  const blob=await(kind==='pdf'?createPDFReport(healthReportResult(r),mode):createExcelReport(healthReportResult(r),mode)),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`TYINSURE_Health_age${r.age}.${kind==='pdf'?'pdf':'xlsx'}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch(e){$('error').hidden=false;$('error').textContent=`ดาวน์โหลดไม่สำเร็จ กรุณาลองอีกครั้ง (${e.message})`;}
 finally{button.textContent=label;button.disabled=!result;}
}
try{
 const healthResponse=await fetch('./health-premiums.json');if(!healthResponse.ok)throw Error('โหลดเบี้ยสุขภาพไม่สำเร็จ');healthData=await healthResponse.json();
 const ciResponse=await fetch('./ci-perfect-care-rates.json');if(!ciResponse.ok)throw Error('โหลดเบี้ยซีไอไม่สำเร็จ');healthData.ci=await ciResponse.json();
 const response=await fetch('./health-rates.json');if(!response.ok)throw Error('โหลดอัตราเบี้ยไม่สำเร็จ');data=await response.json();
 for(const next of ['sum','premium'])$('mode-'+next).addEventListener('click',()=>{
  if($('main-plan').value==='wholelife50000'||next===mode)return;const previous=result;mode=next;
  if(previous)$('amount').value=mode==='sum'?previous.sum:previous.premium;
  for(const m of ['sum','premium']){$('mode-'+m).classList.toggle('active',m===mode);$('mode-'+m).setAttribute('aria-selected',String(m===mode));}render();
 });
 for(const el of [$('age'),$('amount'),$('ci-sum')])el.addEventListener('input',render);
 for(const benefit of [500,1000])$('daily-'+benefit).addEventListener('click',()=>{dailyBenefit=benefit;render();});
 for(const id of ['daily-enabled','ci-enabled','pa-enabled','pa-plan','pa-infant','health-product','health-benefit','health-type','health-option','health-plan','health-area','care-enabled','care-benefit','care-condition','main-infant'])$(id).addEventListener('change',()=>{if(id==='pa-enabled'&&$('pa-enabled').checked)$('pa-plan').value='2';if(id==='care-enabled'&&$('care-enabled').checked)$('care-benefit').value='5000000';if(id==='health-product'&&$('health-product').value==='dhealth')$('health-type').value='none';if(id==='health-product'&&$('health-product').value==='elite'){$('health-plan').value='1';$('health-area').value='0';}render();});
 $('main-plan').addEventListener('change',()=>{if(mode==='sum'){if($('main-plan').value==='smart9920'&&Number($('amount').value)<200000)$('amount').value='200000';const value=Number($('amount').value);if($('main-plan').value==='smart9999-small'&&(value<50001||value>199999))$('amount').value='100000';if($('main-plan').value==='smart9999-large'&&(value<200000||value>=10000000))$('amount').value='200000';}render();});
 $('frequency').addEventListener('change',render);document.querySelectorAll('input[name="gender"]').forEach(el=>el.addEventListener('change',render));
 $('legacy-form').addEventListener('submit',e=>{e.preventDefault();render();});$('excel').addEventListener('click',()=>download('excel'));$('pdf').addEventListener('click',()=>download('pdf'));$('print').addEventListener('click',()=>{render();if(result)window.print();});
 render();$('loading').remove();
}catch(e){$('loading').textContent='โหลดไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ';$('error').hidden=false;$('error').textContent=e.message;for(const id of ['excel','pdf','print'])$(id).disabled=true;summary.update();}
