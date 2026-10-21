import {PA_PLANS,paAnnualPremium} from './pa-easy.mjs';
import {mountCustomerSummary} from './summary-controller.mjs';
import {legacySummary} from './legacy-calculator.mjs';
import {calculateLegacy} from './legacy-calculator.mjs';
import {createExcelReport} from './excel-export.mjs';
import {createPDFReport} from './pdf-export.mjs';
const $=id=>document.getElementById(id),money=n=>n.toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});
let data,mode='sum',result=null;
const input=()=>({age:$('age').value,gender:document.querySelector('input[name="gender"]:checked')?.value,amount:$('amount').value,frequency:$('frequency').value,mode,paEnabled:$('pa-enabled').checked,paPlan:$('pa-plan').value,paOccupation:'1',paHoliday:false,paAtLeast30Days:$('pa-infant').checked});
const summary=mountCustomerSummary({getResult:()=>result,getInput:input,refresh:render,createSummary:legacySummary});
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
function render(){
 updateRiderControls();
 const frequency=data.frequencies.find(f=>f.id===$('frequency').value);
 $('amount-label').innerHTML=mode==='sum'?'ทุนประกัน <span>บาท</span>':`เบี้ยประกัน${frequency.label} <span>บาท/งวด</span>`;
 $('amount-hint').textContent=mode==='sum'?'ระบุทุนประกันที่ต้องการส่งต่อ':'เบี้ยที่กรอกเป็นสัญญาหลัก ไม่รวมสัญญาเพิ่มเติม ทุนแสดงทศนิยม 2 ตำแหน่ง';
 try{
  const r=calculateLegacy(data,input());result=r;$('error').hidden=true;$('legacy-results').classList.remove('invalid');
  $('headline-label').textContent=mode==='sum'?`${r.rider?'เบี้ยสัญญาหลัก':'เบี้ยประกัน'}${r.frequency.label}`:'ทุนประกันที่คำนวณได้';
  $('headline-value').textContent=money(mode==='sum'?r.premium:r.sum);$('headline-unit').textContent=mode==='sum'?'บาท/งวด':'บาท';
  $('complement-label').textContent=mode==='sum'?'ทุนประกัน':`เบี้ยสัญญาหลัก${r.frequency.label}`;$('complement-value').textContent=`${money(mode==='sum'?r.sum:r.premium)} บาท`;
  $('rate-detail').textContent=`อัตรา${r.frequency.label} ${r.rate.toFixed(r.frequency.id==='monthly'?3:2)} บาท ต่อทุน 1,000 บาท`;
  if(r.rider){$('pa-base-annual').textContent=`${money(r.premium)} บาท/งวด`;$('pa-annual').textContent=`${money(r.rider.premium)} บาท/งวด`;$('pa-combined').textContent=`${money(r.combinedFirstYearPremium)} บาท/งวด`;$('pa-cost-title').textContent=`เบี้ยปีแรก • ชำระ${r.frequency.label}`;}
  $('initial-coverage').textContent=money(r.initialCoverage);$('total-paid').textContent=money(r.totalPaid);$('maturity-value').textContent=money(r.maturityAmount);
  $('pay-note').textContent=`บาท · สัญญาหลัก · ${20*r.frequency.payments} งวด ใน 20 ปี`;
  $('start-age').textContent=`${r.age} ปี`;$('paid-age').textContent=`${r.age+20} ปี`;
  $('calculation-note').textContent=`ชำระ${r.frequency.label} ${money(r.premium)} บาท/งวด · รวมต่อปี ${money(r.annualPaid)} บาท · ${mode==='premium'?'ทุนคำนวณตามเบี้ยที่กรอก':'ไม่มีส่วนลดอัตราเบี้ยรายปี'}`;
  $('schedule-description').textContent=`${r.gender==='male'?'ชาย':'หญิง'} อายุเริ่ม ${r.age} ปี · ทุน ${money(r.sum)} บาท · ชำระ${r.frequency.label}`;
  $('schedule-body').innerHTML=r.schedule.map(row=>`<tr class="${[1,20].includes(row.policyYear)||row.age===99?'milestone':''}"><td><span class="age-number">${row.age}</span><span class="phase">${row.policyYear===1?'เริ่มคุ้มครอง':row.age===99?'ครบสัญญา':row.policyYear===20?'ปีสุดท้ายที่ชำระเบี้ย':'ปีกรมธรรม์'}</span></td><td>${row.pay?money(row.pay):'—'}</td>${r.rider?`<td class="rider-premium-value">${row.riderPremium===null?'—':money(row.riderPremium)}</td>`:''}<td>${money(row.paid)}</td><td class="coverage-value">${row.coverage?money(row.coverage):'—'}</td><td class="pension-value">${row.maturity?money(row.maturity):'—'}</td></tr>`).join('');
  $('row-count').textContent=`อายุ ${r.age}–99 ปี · ${r.schedule.length} แถว`;
  $('excel').disabled=false;$('pdf').disabled=false;$('print').disabled=false;summary.update();
 }catch(e){
  result=null;$('error').hidden=false;$('error').textContent=e.message;$('legacy-results').classList.add('invalid');
  for(const id of ['headline-value','complement-value','initial-coverage','total-paid','maturity-value','pa-base-annual','pa-annual','pa-combined'])$(id).textContent='—';
  $('rate-detail').textContent='';$('calculation-note').textContent='กรอกข้อมูลให้ถูกต้องเพื่อดูผลคำนวณ';$('schedule-body').replaceChildren();$('row-count').textContent='ยังไม่มีข้อมูล';$('schedule-description').textContent='';
  for(const id of ['excel','pdf','print'])$(id).disabled=true;summary.update();
 }
}
async function download(kind){
 render();if(!result)return;
 const r=result,button=$(kind),label=button.textContent;button.disabled=true;button.textContent='กำลังสร้างไฟล์…';
 try{
  const blob=await(kind==='pdf'?createPDFReport(r,mode):createExcelReport(r,mode)),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`TYINSURE_Legacy_99-20_age${r.age}.${kind==='pdf'?'pdf':'xlsx'}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch(e){$('error').hidden=false;$('error').textContent=`ดาวน์โหลดไม่สำเร็จ กรุณาลองอีกครั้ง (${e.message})`;}
 finally{button.textContent=label;button.disabled=!result;}
}
try{
 const response=await fetch('./legacy-rates.json');if(!response.ok)throw Error('โหลดอัตราเบี้ยไม่สำเร็จ');data=await response.json();
 for(const next of ['sum','premium'])$('mode-'+next).addEventListener('click',()=>{
  if(next===mode)return;const previous=result;mode=next;
  if(previous)$('amount').value=mode==='sum'?previous.sum:previous.premium;
  for(const m of ['sum','premium']){$('mode-'+m).classList.toggle('active',m===mode);$('mode-'+m).setAttribute('aria-selected',String(m===mode));}render();
 });
 for(const el of [$('age'),$('amount')])el.addEventListener('input',render);
 for(const id of ['pa-enabled','pa-plan','pa-infant'])$(id).addEventListener('change',()=>{if(id==='pa-enabled'&&$('pa-enabled').checked)$('pa-plan').value='2';render();});
 $('frequency').addEventListener('change',render);document.querySelectorAll('input[name="gender"]').forEach(el=>el.addEventListener('change',render));
 $('legacy-form').addEventListener('submit',e=>{e.preventDefault();render();});$('excel').addEventListener('click',()=>download('excel'));$('pdf').addEventListener('click',()=>download('pdf'));$('print').addEventListener('click',()=>{render();if(result)window.print();});
 render();$('loading').remove();
}catch(e){$('loading').textContent='โหลดไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ';$('error').hidden=false;$('error').textContent=e.message;for(const id of ['excel','pdf','print'])$(id).disabled=true;summary.update();}
