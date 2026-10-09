const $=s=>document.querySelector(s);
const sprout=`<svg viewBox="0 0 120 100" fill="none" aria-hidden="true"><ellipse cx="60" cy="87" rx="28" ry="5" fill="#b8cc91" opacity=".2"/><path d="M60 84C61 63 57 50 67 30" stroke="#7c9860" stroke-width="2.4" stroke-linecap="round"/><path d="M60 65C38 65 26 52 30 40C50 37 61 49 60 65Z" fill="#c4d6a1"/><path d="M63 49C64 27 79 18 94 23C94 42 80 50 63 49Z" fill="#a8c282"/><path d="M36 45L59 63M88 28L65 47" stroke="#7c9860" stroke-width="1.2" stroke-linecap="round"/><circle cx="24" cy="23" r="3" fill="#d8bb7f"/><path d="M100 63v8m-4-4h8" stroke="#c4ccae" stroke-linecap="round"/></svg>`;
$('.mark').innerHTML=sprout;
$('#history .empty').innerHTML='<span class="empty-illustration">'+sprout+'</span><span>记下的片刻，会留在这里。</span><span class="empty-whisper">慢慢来，一点点也算。</span>';
const flourish=document.createElement('div');
flourish.className='page-flourish';
flourish.setAttribute('aria-hidden','true');
flourish.innerHTML=`<svg viewBox="0 0 340 72" fill="none">
  <defs><filter id="leaf-paper" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".16" numOctaves="3" seed="8" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="1.4" xChannelSelector="R" yChannelSelector="G"/></filter><pattern id="leaf-pencil" width="5" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><path d="M1 0L1.5 6M4 1L3.6 5" stroke="#8ca777" stroke-width=".55" opacity=".24"/></pattern></defs>
  <path d="M12 52C43 61 68 53 91 42S139 24 166 33S218 54 254 47S305 30 329 20" stroke="#b4c798" stroke-width="1.1" stroke-linecap="round" stroke-dasharray="1 7 2 6"/>
  <g filter="url(#leaf-paper)" stroke-linecap="round" stroke-linejoin="round">
    <path d="M248 48C241 42 239 34 240 28C241 21 248 16 256 12C259 18 262 24 261 30C260 39 253 42 248 48Z" fill="#d4dfb8" fill-opacity=".82" stroke="#a6ba8d" stroke-width=".8"/>
    <path d="M248 48C253 39 261 34 268 35C275 34 281 39 285 43C280 48 274 53 267 53C260 54 253 50 248 48Z" fill="#e2e8c9" stroke="#b4c49b" stroke-width=".8"/>
    <path d="M248 48C241 42 239 34 240 28C241 21 248 16 256 12C259 18 262 24 261 30C260 39 253 42 248 48ZM248 48C253 39 261 34 268 35C275 34 281 39 285 43C280 48 274 53 267 53C260 54 253 50 248 48Z" fill="url(#leaf-pencil)"/>
    <path d="M246 53C249 42 251 30 255 19M249 48C258 44 269 44 279 43M251 33L245 28M253 27L258 23M250 40L244 35M259 45L264 39M267 44L272 49" stroke="#8da577" stroke-width=".85" opacity=".7"/>
    <path d="M239 29C239 22 246 16 254 13M263 35C272 32 279 37 283 41M247 53C250 40 250 31 254 21" stroke="#a4b78b" stroke-width=".65" opacity=".4"/>
  </g>
  <path d="M56 46C59 43 63 46 62 49C61 53 56 51 56 48Z" fill="#dfc99e"/><circle cx="173" cy="35" r="2" fill="#aabf86"/>
</svg>`;
document.querySelector('header').after(flourish);
$('#save').addEventListener('click',()=>{
  if(!selected.size&&!$('#note').value.trim())return;
  $('.app').classList.remove('just-recorded');
  void $('.app').offsetWidth;
  $('.app').classList.add('just-recorded');
  setTimeout(()=>$('.app').classList.remove('just-recorded'),900);
});
const groups={情绪:['低落','焦虑','烦躁','空','想哭','平静'],身体:{头部:['头痛','头晕'],胸部:['胸闷','心悸','电流感'],手部:['电流感'],腹部:['恶心','腹痛'],四肢:['手抖','发麻'],全身:['乏力','疲惫']},状态:['注意力差','启动困难','过载','飘','脑子关不掉','说不清的难受'],'念头与冲动':['消极想法','自伤念头 / 冲动'],活动:['哭','出门','社交','运动','兴趣活动'],用药:['正常服药','晚服','漏服','不适'],'其他 / 不确定':[]};
let favorites=['低落','想哭','乏力','胸闷','说不清的难受'];
let expandedTag=null;
const descriptions={'电流感':'从心口传到手掌'};
const selected=new Set(),ratings={},thoughtSelections=new Map();let records=[];
const occurrenceParts=new Map();
const degreeExamples={
  '低落':['心情有些往下沉，仍能投入聊天或手头的事。','回应别人需要多一点力气，原本想做的事有些提不起劲。','更想独处，聊天或做喜欢的事也很难投入。','想做的事常常停下，回复消息、照顾自己都变得吃力。','低落占据几乎全部注意力，此刻很难进行日常小事。'],
  '焦虑':['脑中冒出担心，转去做别的事时还能放下。','反复想同一件事，要提醒自己才回到眼前。','很难停止担心，读一段文字或听别人说话会不断走神。','坐着也难安定，需要暂停手头的事才能缓一缓。','担心几乎占满脑子，此刻很难交谈或做简单的事。'],
  '烦躁':['对声音或打扰有点不耐烦，仍能照常回应。','更容易嫌烦，说话前需要停一下，避免语气变冲。','想离开人群或关掉声音，继续相处需要花力气。','小小的打扰也难承受，需要中断交谈或手头的事。','此刻很难待在原来的环境里，也很难继续回应别人。'],
  '想哭':['眼眶有一点酸，仍能自然说话、做事。','说到某些话会哽住，需要停一下。','泪意不断涌上来，听人说话或做事时要分心忍住。','很难完整说完一句话，需要暂停交谈或手头的事。','此刻几乎无法继续交谈或做事，只想停下来让情绪过去。'],
  '头晕':['头有些发飘，坐着做事还和平时差不多。','转头或起身时会晕，需要放慢动作。','走动时想扶住东西，做事需要停下来坐一会儿。','站立或走动很吃力，需要扶持，常要坐下。','此刻很难保持坐稳或站稳，需要别人协助。'],
  '胸闷':['胸口有点压着的感觉，做事时有时会忘记。','坐着也能感觉到闷，但仍能继续聊天或做事。','胸口的不适反复拉走注意力，需要停下来。','很难继续手头的事，想一直安静坐着休息。','胸口的不适占据几乎全部注意力，日常小事也难继续。'],
  '心悸':['偶尔注意到心跳，仍能做眼前的事。','心跳感很明显，聊天或看东西时会分心。','反复注意心跳，需要停下来坐一会儿。','难以把注意力移开，很难继续交谈或做事。','心跳带来的不适占满注意力，此刻很难进行日常小事。'],
  '恶心':['胃里有点翻，但仍愿意吃喝。','看到或闻到食物会不舒服，吃喝需要放慢。','吃几口就想停下，做事也会被恶心打断。','一想到吃喝就难受，很难继续进食或手头的事。','恶心占据几乎全部注意力，此刻很难吃喝或做日常小事。'],
  '腹痛':['腹部隐约疼，做事时有时会忘记。','能清楚感觉到疼，但还能继续走动或做事。','疼痛反复打断手头的事，需要停下或换姿势。','很难继续走动、交谈或做事，想保持一个舒服些的姿势。','疼痛占据几乎全部注意力，日常小事也难进行。'],
  '手抖':['仔细看才注意到手在抖，拿东西仍很稳。','拿杯子或写字时能看出抖，仍能完成。','写字、点屏幕或拿小东西需要放慢、多试几次。','容易拿不稳或洒出东西，需要另一只手协助。','此刻很难稳稳拿住东西或完成精细动作。'],
  '发麻':['局部有一点麻，仍能自然使用那个部位。','麻的感觉很明确，但走动或拿东西仍能完成。','麻的感觉反复打断注意力，使用那个部位时会停一下。','很难忽略麻的感觉，手头的事需要中断。','麻的感觉占据几乎全部注意力，日常小事难以继续。'],
  '疲惫':['想稍微歇一下，仍有精神完成眼前的事。','做事比平时慢，想减少聊天或活动。','做一小段就想休息，难以连续做完一件事。','休息后仍很难继续，日常安排需要大幅减少。','此刻很难投入任何日常小事，需要一直休息。'],
  '注意力差':['偶尔走神，能自己回到原来的内容。','看文字要重读，听人说话有时漏掉几句。','频繁丢掉思路，一小段文字也需要反复看。','很难跟上交谈或完成几步的事情，需要别人提醒。','此刻连一句话或一个简单步骤都很难持续跟住。'],
  '启动困难':['需要想一下，但仍能开始第一步。','知道要做什么，拖一会儿或提醒自己才能开始。','东西已经准备好，仍要反复鼓励自己才迈出第一步。','试着开始几次又停下，需要别人陪着或帮忙拆成小步。','此刻连起身、拿起物品等第一步也很难启动。'],
  '过载':['信息有点多，减少一点干扰后还能继续。','同时有人说话、手机响时会乱，需要一件件处理。','听说话或做选择开始吃力，需要暂停、减少声音和信息。','很难继续回应或决定下一步，需要离开刺激多的环境。','此刻很难处理新的话语、声音或请求，需要安静停下来。'],
  '脑子关不掉':['念头有点多，仍能转去做眼前的事。','安静下来就不断想事情，要提醒自己才回到当下。','念头接连冒出，休息或看文字时很难停下来。','尝试放松也停不住，交谈或手头的事反复被打断。','念头几乎占满注意力，此刻很难休息或进行简单的事。'],
  '乏力':[
    '手脚有一点沉，起身、走动和抬手仍和平时差不多。',
    '走动或说话更费力，想少走几步、少说几句，但仍能完成。',
    '手脚明显沉，走一小段或做一件小事就想坐下，抬手拿东西需要花力气。',
    '起身、走动或抬手都很吃力，常要停下来，或需要别人帮忙。',
    '此刻很难起身或抬起手脚，想动也难以完成，日常小事需要别人帮忙。'
  ],
  '头痛':['能感觉到疼，做事时有时会忘记它。','做事时会注意到疼，但还能继续。','疼痛反复打断注意力，需要停下来休息。','很难继续看屏幕、交谈或做手头的事。','疼痛占据几乎全部注意力，难以进行日常活动。']
};
const observationHints={
  '电流感':'可以在补充里写：从哪里到哪里、一下还是一阵、当时在做什么。',
  '空':'可以写：情绪像消失了、对事情没反应，还是心里空落落的。',
  '平静':'可以写：身体放松了、念头少了，或只是这一刻觉得安稳。',
  '飘':'可以写：周围像隔着一层、身体不像自己的，或注意力飘远了。',
  '说不清的难受':'不用急着命名。可以写身体哪里不舒服、当时在做什么，或只留下这个词。'
};
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chip=name=>`<button type="button" class="chip ${selected.has(name)?'active':''}" data-tag="${escapeHTML(name)}" aria-pressed="${selected.has(name)}">${escapeHTML(name)}</button>`;
let bodyExpanded=false;
let highlightedCategory=null;
function renderTags(){
 $('#favorites').innerHTML=favorites.map(chip).join('');
 $('#categories').innerHTML=Object.entries(groups).map(([name,tags],i)=>{
 const body=name==='身体';
 const content=body?(bodyExpanded?Object.entries(tags).map(([part,list])=>'<section class="body-part-row"><h4>'+escapeHTML(part)+'</h4><div class="chips">'+list.map(chip).join('')+'</div></section>').join(''):'<div class="body-preview">'+Object.keys(tags).map(part=>'<button type="button" data-body-open aria-expanded="false" aria-controls="body-options">'+escapeHTML(part)+'</button>').join('')+'</div>'):'<div class="chips">'+tags.map(chip).join('')+'</div>'+(tags.length?'':'<span class="meta">可自定义</span>');
 return '<section class="category-line"><button type="button" class="category-label '+(highlightedCategory===name?'current':'')+'" data-category="'+escapeHTML(name)+'" '+(body?'aria-expanded="'+bodyExpanded+'" aria-controls="body-options"':'aria-label="'+escapeHTML(name)+'分类"')+'>'+escapeHTML(name)+(body?'<span class="body-toggle">'+(bodyExpanded?'收起 −':'展开 ＋')+'</span>':'')+'</button><div class="category-content" '+(body?'id="body-options"':'')+'>'+content+'</div></section>';
 }).join('');
 renderSelected();
}
document.addEventListener('click',event=>{
 const label=event.target.closest('[data-category]');
 const part=event.target.closest('[data-body-open]');
 if(!label&&!part)return;
 if(part){bodyExpanded=true;highlightedCategory='身体';}
 else{highlightedCategory=label.dataset.category;if(highlightedCategory==='身体')bodyExpanded=!bodyExpanded;}
 renderTags();
 const active=[...document.querySelectorAll('[data-category]')].find(b=>b.dataset.category===highlightedCategory);
 active?.focus({preventScroll:true});
});
function categoryOf(tag){return Object.keys(groups).find(g=>Object.values(groups[g]).flat().includes(tag));}
function bodyPartsOf(tag){return Object.entries(groups.身体).filter(([,tags])=>tags.includes(tag)).map(([part])=>part);}
function renderSelected(){
  $('#selected-area').hidden=!selected.size;
  $('#selected-count').textContent=selected.size;
  if(!selected.has(expandedTag)) expandedTag=null;
  const compact=[...selected].map(tag=>'<button type="button" class="chip active" data-expand="'+escapeHTML(tag)+'" aria-expanded="'+(expandedTag===tag)+'">'+escapeHTML(tag)+(ratings[tag]?' · '+ratings[tag]:'')+'</button>').join('');
  let detail='';
  if(expandedTag){
    const tag=expandedTag,category=categoryOf(tag),thought=category==='念头与冲动';
    const rated=!!degreeExamples[tag];
    detail='<div class="selected-detail"><div class="selected-label"><strong>'+escapeHTML(tag)+'</strong><button class="text-button" data-tag="'+escapeHTML(tag)+'">移除</button></div>';
    if(bodyPartsOf(tag).length){
      const parts=[...new Set([...bodyPartsOf(tag),'其他部位','说不清'])];
      detail+='<p class="detail-heading">这次在哪里 <span>可多选 · 可留空</span></p><div class="chips occurrence-parts">'+parts.map(part=>'<button type="button" class="chip '+(occurrenceParts.get(tag)?.has(part)?'active':'')+'" data-occurrence-part="'+escapeHTML(part)+'" data-name="'+escapeHTML(tag)+'" aria-pressed="'+!!occurrenceParts.get(tag)?.has(part)+'">'+escapeHTML(part)+'</button>').join('')+'</div>';
    }
    if(descriptions[tag])detail+='<p class="tag-description">'+escapeHTML(descriptions[tag])+'</p>';
    if(rated){
      detail+='<div class="rating" role="group" aria-label="'+escapeHTML(tag)+'程度">'+[1,2,3,4,5].map(n=>'<button type="button" data-rating="'+n+'" data-name="'+escapeHTML(tag)+'" class="'+(ratings[tag]===n?'active':'')+'" aria-label="'+escapeHTML(tag)+'程度 '+n+' / 5" aria-pressed="'+(ratings[tag]===n)+'"><span class="rating-dot" aria-hidden="true"></span><span class="rating-number" aria-hidden="true">'+n+'</span></button>').join('')+'</div>';
      const examples=degreeExamples[tag];
      const help=examples?(ratings[tag]?examples[ratings[tag]-1]:'点圆点看看对应的例子，也可以不评分。'):'按你这次的感受选择，也可以不评分。';
      detail+='<div class="degree-reference" aria-live="polite"><span class="meta">'+(examples?'参考例子'+(ratings[tag]?' · '+ratings[tag]+' / 5':''):'这次的程度')+'</span><p class="rating-caption">'+escapeHTML(help)+'</p>'+(examples?'<p class="reference-note">只作个人对照，选最接近的一档，不必每句话都符合。</p>':'')+'</div>';
      if(tag==='乏力')detail+='<p class="reference-note">“不想动”和“想动却使不上力”可以分别写在补充里；不必只凭不想动来选程度。</p>';
    }else detail+='<p class="meta">'+(thought?'只记这个分类也可以，不需要评分或解释。':observationHints[tag]??'记下这个词就可以，不需要评分。')+'</p>';
    detail+='</div>';
  }
  $('#selected').innerHTML='<div class="chips selected-chips">'+compact+'</div>'+detail;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-tag]');
  if(b){const tag=b.dataset.tag;if(selected.has(tag)){selected.delete(tag);delete ratings[tag];occurrenceParts.delete(tag);}else selected.add(tag);renderTags();}
  const part=e.target.closest('[data-occurrence-part]');
  if(part){const tag=part.dataset.name,value=part.dataset.occurrencePart;const parts=occurrenceParts.get(tag)??new Set();parts.has(value)?parts.delete(value):parts.add(value);occurrenceParts.set(tag,parts);renderSelected();}
  const x=e.target.closest('[data-expand]');
  if(x){expandedTag=expandedTag===x.dataset.expand?null:x.dataset.expand;renderSelected();}
  const r=e.target.closest('[data-rating]');
  if(r){const n=Number(r.dataset.rating);ratings[r.dataset.name]=ratings[r.dataset.name]===n?null:n;renderSelected();}
});
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-pressed',t===b)});$('#record').hidden=b.dataset.page!=='record';$('#export').hidden=b.dataset.page!=='export';});
$('#time-toggle').onclick=()=>{$('#time-field').hidden=!$('#time-field').hidden;};
function toast(msg){$('#toast').textContent=msg;$('#toast').style.display='block';clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').style.display='none',2400);}
$('#save').onclick=()=>{if(!selected.size&&!$('#note').value.trim()&&!thoughtSelections.size){toast('选一个标签，或写一句话就好');return;}const date=$('#occurred').value?new Date($('#occurred').value):new Date();records.unshift({date,tags:[...selected].map(t=>t+(occurrenceParts.get(t)?.size?'（'+[...occurrenceParts.get(t)].join('、')+'）':'')+(ratings[t]?` · ${ratings[t]}`:'')),thoughts:[...thoughtSelections.keys()],note:$('#note').value.trim()});$('#history').innerHTML=records.map(r=>`<article class="history-item"><small>${r.date.toLocaleString('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})} · 演示记录</small><p>${r.tags.map(escapeHTML).join(' · ')}</p>${r.thoughts.map(t=>`<p>${escapeHTML(t)}</p>`).join('')}<p>${escapeHTML(r.note)}</p></article>`).join('');selected.clear();occurrenceParts.clear();Object.keys(ratings).forEach(k=>delete ratings[k]);thoughtSelections.clear();document.querySelectorAll('[data-thought]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});$('#note').value='';$('#occurred').value='';$('#time-field').hidden=true;renderTags();toast('已记下，往下可以回看');};
$('#add').onclick=()=>{$('#library').innerHTML=[...new Set(Object.values(groups).flatMap(g=>Array.isArray(g)?g:Object.values(g).flat()))].map(t=>`<button type="button" class="chip ${favorites.includes(t)?'active':''}" data-favorite="${escapeHTML(t)}" aria-pressed="${favorites.includes(t)}">${escapeHTML(t)}</button>`).join('');$('#add-dialog').showModal();};
$('#library').onclick=e=>{const b=e.target.closest('[data-favorite]');if(!b)return;const t=b.dataset.favorite;favorites=favorites.includes(t)?favorites.filter(x=>x!==t):[...favorites,t];b.classList.toggle('active',favorites.includes(t));b.setAttribute('aria-pressed',favorites.includes(t));renderTags();};
$('#close').onclick=()=>$('#add-dialog').close();$('#custom-category').onchange=()=>$('#body-part-field').hidden=$('#custom-category').value!=='身体';
$('#add-form').onsubmit=e=>{e.preventDefault();const name=$('#custom-name').value.trim();if(!name){$('#custom-name').focus();return;}if(categoryOf(name)){toast('已有这个标签，可以从上方添加');return;}const g=$('#custom-category').value;if(g==='身体'){const parts=[...document.querySelectorAll('[name="body-part"]:checked')].map(e=>e.value);if(!parts.length){toast('选一个部位，或选其他部位');return;}parts.forEach(p=>(groups.身体[p]??=[]).push(name));}else groups[g].push(name);descriptions[name]=$('#custom-description').value.trim();favorites.push(name);renderTags();$('#custom-name').value='';$('#custom-description').value='';document.querySelectorAll('[name="body-part"]').forEach(e=>e.checked=false);$('#add-dialog').close();toast('已添加到常用');};
document.querySelectorAll('.ranges .chip').forEach(b=>b.onclick=()=>{document.querySelectorAll('.ranges .chip').forEach(c=>c.classList.toggle('active',c===b));$('#custom-range').hidden=b.textContent!=='自定义';});
renderTags();
// Calendar selection is preview-only, just like the demo records.
(() => {
  const host = document.querySelector('#custom-range');
  const today = new Date();
  let month = new Date(today.getFullYear(), today.getMonth(), 1);
  const selectedDays = new Set();
  let gesture = null;
  const key = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  host.innerHTML = `<section class="calendar" aria-label="选择导出日期">
    <div class="calendar-heading"><button type="button" data-month="-1" aria-label="上个月">‹</button><h3 id="calendar-month" aria-live="polite"></h3><button type="button" data-month="1" aria-label="下个月">›</button></div>
    <p class="calendar-hint">点选日期，或按住滑动；从已选日期开始滑动可取消。</p>
    <div class="calendar-week" aria-hidden="true">${['一','二','三','四','五','六','日'].map(d=>`<span>${d}</span>`).join('')}</div>
    <div class="calendar-days" aria-labelledby="calendar-month"></div>
    <div class="calendar-bottom"><span id="calendar-status" role="status"></span><button type="button" id="calendar-clear" class="text-button">清空选择</button></div>
  </section>`;
  const grid = host.querySelector('.calendar-days');
  const status = host.querySelector('#calendar-status');
  function updateSelection() {
    grid.querySelectorAll('[data-date]').forEach(button => {
      const on = selectedDays.has(button.dataset.date);
      button.classList.toggle('selected', on);
      button.setAttribute('aria-pressed', String(on));
    });
    status.textContent = selectedDays.size ? `已选 ${selectedDays.size} 天` : '还未选择日期';
    host.querySelector('#calendar-clear').disabled = !selectedDays.size;
  }
  function render() {
    const year = month.getFullYear(), m = month.getMonth();
    host.querySelector('#calendar-month').textContent = `${year} 年 ${m+1} 月`;
    const offset = (month.getDay()+6)%7;
    const days = new Date(year,m+1,0).getDate();
    grid.innerHTML = '<span class="calendar-blank" aria-hidden="true"></span>'.repeat(offset)
      + Array.from({length:days},(_,i)=>{
        const date = new Date(year,m,i+1), dateKey = key(date);
        return `<button type="button" class="calendar-day" data-date="${dateKey}" aria-label="${year}年${m+1}月${i+1}日" ${dateKey===key(today)?'aria-current="date"':''}>${i+1}</button>`;
      }).join('');
    updateSelection();
  }
  function paint(button) {
    if (!gesture || !button || gesture.visited.has(button.dataset.date)) return;
    const date = button.dataset.date;
    gesture.visited.add(date);
    gesture.select ? selectedDays.add(date) : selectedDays.delete(date);
    updateSelection();
  }
  grid.addEventListener('pointerdown',event=>{
    const button = event.target.closest('[data-date]');
    if (!button || event.button!==0 || !event.isPrimary) return;
    gesture = {id:event.pointerId,select:!selectedDays.has(button.dataset.date),visited:new Set(),before:new Set(selectedDays)};
    grid.setPointerCapture(event.pointerId);
    paint(button);
  });
  grid.addEventListener('pointermove',event=>{
    if (!gesture || gesture.id!==event.pointerId) return;
    const target = document.elementFromPoint(event.clientX,event.clientY);
    const button = target?.closest('[data-date]');
    if (button && grid.contains(button)) paint(button);
  });
  grid.addEventListener('pointerup',event=>{
    if (gesture?.id===event.pointerId) { gesture=null; if(grid.hasPointerCapture(event.pointerId)) grid.releasePointerCapture(event.pointerId); }
  });
  grid.addEventListener('pointercancel',()=>{
    if (gesture) { selectedDays.clear();gesture.before.forEach(d=>selectedDays.add(d));gesture=null;updateSelection(); }
  });
  grid.addEventListener('lostpointercapture',()=>{gesture=null;});
  grid.addEventListener('click',event=>{
    // Pointer selection is handled above; keyboard/assistive clicks come here.
    if(event.detail!==0)return;
    const button=event.target.closest('[data-date]');if(!button)return;
    const date=button.dataset.date;
    selectedDays.has(date)?selectedDays.delete(date):selectedDays.add(date);
    updateSelection();
  });
  host.querySelectorAll('[data-month]').forEach(button=>button.addEventListener('click',()=>{
    month=new Date(month.getFullYear(),month.getMonth()+Number(button.dataset.month),1);render();
  }));
  host.querySelector('#calendar-clear').addEventListener('click',()=>{selectedDays.clear();updateSelection();});
  render();
})();
