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
  if(!selected.size)return;
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
const occurrenceParts=new Map(),tagNotes=new Map();
let editingId=null,draftBeforeEdit=null,pendingDeleteId=null,deletedRecords=[];
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
    const rated=!!degreeExamples[tag]||thought;
    detail='<div class="selected-detail"><div class="selected-label"><strong>'+escapeHTML(tag)+'</strong><button class="text-button" data-tag="'+escapeHTML(tag)+'">移除</button></div>';
    if(bodyPartsOf(tag).length){
      const parts=[...new Set([...bodyPartsOf(tag),'其他部位','说不清'])];
      detail+='<p class="detail-heading">这次在哪里 <span>可多选 · 可留空</span></p><div class="chips occurrence-parts">'+parts.map(part=>'<button type="button" class="chip '+(occurrenceParts.get(tag)?.has(part)?'active':'')+'" data-occurrence-part="'+escapeHTML(part)+'" data-name="'+escapeHTML(tag)+'" aria-pressed="'+!!occurrenceParts.get(tag)?.has(part)+'">'+escapeHTML(part)+'</button>').join('')+'</div>';
    }
    if(descriptions[tag])detail+='<p class="tag-description">'+escapeHTML(descriptions[tag])+'</p>';
    if(rated){
      detail+='<div class="rating" role="group" aria-label="'+escapeHTML(tag)+'程度">'+[1,2,3,4,5].map(n=>'<button type="button" data-rating="'+n+'" data-name="'+escapeHTML(tag)+'" class="'+(ratings[tag]===n?'active':'')+'" aria-label="'+escapeHTML(tag)+'程度 '+n+' / 5" aria-pressed="'+(ratings[tag]===n)+'"><span class="rating-dot" aria-hidden="true"></span><span class="rating-number" aria-hidden="true">'+n+'</span></button>').join('')+'</div>';
      const examples=degreeExamples[tag];
      const help=examples?(ratings[tag]?examples[ratings[tag]-1]:'点圆点看看对应的例子，也可以不评分。'):(thought?'只按这次念头或冲动的强烈程度选择，也可以不评分。':'按你这次的感受选择，也可以不评分。');
      detail+='<div class="degree-reference" aria-live="polite"><span class="meta">'+(examples?'参考例子'+(ratings[tag]?' · '+ratings[tag]+' / 5':''):(thought?'这次的强烈程度':'这次的程度'))+'</span><p class="rating-caption">'+escapeHTML(help)+'</p>'+(examples?'<p class="reference-note">只作个人对照，选最接近的一档，不必每句话都符合。</p>':'')+'</div>';
      if(tag==='乏力')detail+='<p class="reference-note">“不想动”和“想动却使不上力”可以分别写在补充里；不必只凭不想动来选程度。</p>';
    }else detail+='<p class="meta">'+(thought?'只记这个分类也可以，不需要评分或解释。':observationHints[tag]??'记下这个词就可以，不需要评分。')+'</p>';
    detail+='<label class="note-label" for="tag-note">想补充的话 <span>可不填</span></label><textarea id="tag-note" data-note-tag="'+escapeHTML(tag)+'" rows="2" placeholder="补充这个标签的感受、当时在做什么……">'+escapeHTML(tagNotes.get(tag)||'')+'</textarea></div>';
  }
  $('#selected').innerHTML='<div class="chips selected-chips">'+compact+'</div>'+detail;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-tag]');
  if(b){const tag=b.dataset.tag;if(selected.has(tag)){selected.delete(tag);delete ratings[tag];occurrenceParts.delete(tag);tagNotes.delete(tag);}else selected.add(tag);renderTags();}
  const part=e.target.closest('[data-occurrence-part]');
  if(part){const tag=part.dataset.name,value=part.dataset.occurrencePart;const parts=occurrenceParts.get(tag)??new Set();parts.has(value)?parts.delete(value):parts.add(value);occurrenceParts.set(tag,parts);renderSelected();}
  const x=e.target.closest('[data-expand]');
  if(x){expandedTag=expandedTag===x.dataset.expand?null:x.dataset.expand;renderSelected();}
  const r=e.target.closest('[data-rating]');
  if(r){const n=Number(r.dataset.rating);ratings[r.dataset.name]=ratings[r.dataset.name]===n?null:n;renderSelected();}
});
document.addEventListener('input',e=>{if(e.target.matches('[data-note-tag]'))tagNotes.set(e.target.dataset.noteTag,e.target.value);});

function showPage(page){document.querySelectorAll('.tab').forEach(t=>{t.classList.toggle('active',t.dataset.page===page);t.setAttribute('aria-pressed',t.dataset.page===page)});$('#record').hidden=page!=='record';$('#export').hidden=page!=='export';}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
$('#time-toggle').onclick=()=>{$('#time-field').hidden=!$('#time-field').hidden;};
function toast(msg){$('#toast').textContent=msg;$('#toast').style.display='block';clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').style.display='none',2400);}
$('#save').onclick=()=>{
 if(!selected.size&&!thoughtSelections.size&&!$('#legacy-note').value.trim()){toast('先选一个标签，就可以记下');return;}
 const editIndex=editingId===null?-1:records.findIndex(r=>r.id===editingId);
 if(editingId!==null&&editIndex<0){toast('这条记录已不存在，请取消修改');return;}
 const previous=editIndex>=0?records[editIndex]:null;
 const date=previous&&$('#occurred').value===localDateTime(previous.date)?new Date(previous.date):($('#occurred').value?new Date($('#occurred').value):new Date());
 if(!Number.isFinite(date.getTime())){toast('请检查发生时间');return;}
 const record={...previous,id:previous?.id??(crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('')),date:date.toISOString(),tags:[...selected].map(name=>({name,parts:[...(occurrenceParts.get(name)??[])],rating:ratings[name]??null,note:(tagNotes.get(name)||'').trim()})),thoughts:[...thoughtSelections.keys()],note:editingId!==null?$('#legacy-note').value.trim():''};
 if(previous)records[editIndex]=record;else records.unshift(record);
 if(!persist()){if(previous)records[editIndex]=previous;else records.shift();return;}
 if(previous){finishEditing();selectingDates=false;showPage('export');}else{
 selected.clear();occurrenceParts.clear();tagNotes.clear();Object.keys(ratings).forEach(k=>delete ratings[k]);thoughtSelections.clear();
 document.querySelectorAll('[data-thought]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});
 $('#occurred').value='';$('#time-field').hidden=true;
 }
 reviewDay=dayKey(date);reviewMonth=new Date(date.getFullYear(),date.getMonth(),1);
 renderTags();renderReview();renderReport();toast(previous?'修改已保存':'已保存到本机');
};
$('#add').onclick=()=>{$('#library').innerHTML=[...new Set(Object.values(groups).flatMap(g=>Array.isArray(g)?g:Object.values(g).flat()))].map(t=>`<button type="button" class="chip ${favorites.includes(t)?'active':''}" data-favorite="${escapeHTML(t)}" aria-pressed="${favorites.includes(t)}">${escapeHTML(t)}</button>`).join('');$('#add-dialog').showModal();};
$('#library').onclick=e=>{const b=e.target.closest('[data-favorite]');if(!b)return;const t=b.dataset.favorite;favorites=favorites.includes(t)?favorites.filter(x=>x!==t):[...favorites,t];b.classList.toggle('active',favorites.includes(t));b.setAttribute('aria-pressed',favorites.includes(t));renderTags();};
$('#close').onclick=()=>$('#add-dialog').close();$('#custom-category').onchange=()=>$('#body-part-field').hidden=$('#custom-category').value!=='身体';
$('#add-form').onsubmit=e=>{e.preventDefault();const name=$('#custom-name').value.trim();if(!name){$('#custom-name').focus();return;}if(categoryOf(name)){toast('已有这个标签，可以从上方添加');return;}const g=$('#custom-category').value;if(g==='身体'){const parts=[...document.querySelectorAll('[name="body-part"]:checked')].map(e=>e.value);if(!parts.length){toast('选一个部位，或选其他部位');return;}parts.forEach(p=>(groups.身体[p]??=[]).push(name));}else groups[g].push(name);descriptions[name]=$('#custom-description').value.trim();favorites.push(name);renderTags();$('#custom-name').value='';$('#custom-description').value='';document.querySelectorAll('[name="body-part"]').forEach(e=>e.checked=false);$('#add-dialog').close();toast('已添加到常用');};

renderTags();

const storageKey='cike-v1';
const dayKey=date=>{const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
let reviewDay=dayKey(new Date()),reviewMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);
let storageReadable=true;
try{
 const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
 if(saved){
  if(!Array.isArray(saved.records))throw Error('invalid storage');
  records=saved.records;
  deletedRecords=Array.isArray(saved.deletedRecords)?saved.deletedRecords:[];
  if(saved.favorites)favorites=saved.favorites;
  if(saved.groups)Object.assign(groups,saved.groups);
  if(saved.descriptions)Object.assign(descriptions,saved.descriptions);
 }
}catch(error){storageReadable=false;toast('本机数据未能读取，请勿继续记录或清理应用数据');}
function persist(){
 if(!storageReadable){toast('请先处理本机数据读取问题');return false;}
 try{localStorage.setItem(storageKey,JSON.stringify({version:1,records,deletedRecords,favorites,groups,descriptions}));return true;}
 catch(error){toast('保存失败，可能是存储空间不足；内容仍留在页面');return false;}
}
$('.draft').textContent='仅存本机';
$('#export').innerHTML=`<div class="section-head"><h2>留下的片刻</h2><div class="history-actions"><button id="undo-delete" class="text-button" hidden>撤销删除</button><button id="select-dates" class="text-button">选择日期</button></div></div><p class="subtext" id="calendar-help">点击查看当天记录，长按选择导出日期。</p><div id="review-calendar" class="calendar"></div><section id="selection-tools" hidden><div class="section-head"><span id="selection-status" class="meta"></span><button id="cancel-selection" class="text-button">取消选择</button></div><div class="chips ranges">${[7,14,30].map(n=>`<button class="chip" data-quick-days="${n}">${n} 天</button>`).join('')}<button class="chip" data-quick-custom>自定义</button></div><div class="report-range" id="custom-range" hidden><label>开始日期<input type="date" id="report-start"></label><label>结束日期<input type="date" id="report-end"></label></div><button class="save" id="print-report">导出给医生的记录</button></section><div id="history"></div>`;
$('.history').remove();
const reviewTab=document.querySelector('[data-page="export"]');reviewTab.textContent='回看 / 导出';
let selectingDates=false,rangeAnchor=null,rangeStart=null,rangeEnd=null,activeQuick=null;
function chooseRange(anchor,end){
 selectingDates=true;rangeAnchor=anchor;[rangeStart,rangeEnd]=[anchor,end].sort();
 $('#report-start').value=rangeStart;$('#report-end').value=rangeEnd;
 renderReview();
}
function activateDate(key,longPress=false){
 if(longPress){activeQuick=null;chooseRange(key,key);return;}
 if(selectingDates){activeQuick=null;chooseRange(rangeAnchor||key,key);}
 else{reviewDay=key;renderReview();}
}
function recordHTML(r,actions=false){
 return `<article class="history-item"><small>${escapeHTML(new Date(r.date).toLocaleString('zh-CN',{hour:'2-digit',minute:'2-digit'}))}</small><ul class="record-tags">${r.tags.map(t=>`<li><strong>${escapeHTML(t.name)}</strong>${t.parts.length?' · '+escapeHTML(t.parts.join('、')):''}${t.rating?' · 程度 '+t.rating+'/5':''}${t.note?'<p class="tag-history-note">'+escapeHTML(t.note)+'</p>':''}</li>`).join('')}</ul>${(r.thoughts||[]).map(t=>`<p>${escapeHTML(t)}</p>`).join('')}${r.note?`<p>${escapeHTML(r.note)}</p>`:''}${actions===true?`<div class="history-item-actions"><button class="text-button" data-edit-record="${escapeHTML(r.id)}">编辑</button><button class="text-button" data-delete-record="${escapeHTML(r.id)}">删除</button></div>`:''}</article>`;
}
function renderReview(){
 const year=reviewMonth.getFullYear(),month=reviewMonth.getMonth();
 const counts=new Map();records.forEach(r=>{const key=dayKey(r.date);counts.set(key,(counts.get(key)||0)+1);});
 $('#review-calendar').innerHTML=`<div class="calendar-heading"><button data-review-month="-1" aria-label="上个月">‹</button><h3>${year} 年 ${month+1} 月</h3><button data-review-month="1" aria-label="下个月">›</button></div><div class="calendar-week">${['一','二','三','四','五','六','日'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-days">${'<span></span>'.repeat((reviewMonth.getDay()+6)%7)}${Array.from({length:new Date(year,month+1,0).getDate()},(_,i)=>{const key=dayKey(new Date(year,month,i+1)),count=counts.get(key)||0;return `<button class="calendar-day ${selectingDates?(key>=rangeStart&&key<=rangeEnd?'selected':''):(key===reviewDay?'viewing':'')}" data-review-day="${key}" aria-pressed="${selectingDates?key>=rangeStart&&key<=rangeEnd:key===reviewDay}" aria-label="${key}，${count} 条记录">${i+1}${count?'<span class="day-dot"></span>':''}</button>`;}).join('')}</div>`;
 $('#undo-delete').hidden=!deletedRecords.length;
 $('#selection-tools').hidden=!selectingDates;$('#select-dates').hidden=selectingDates;
 $('#calendar-help').textContent=selectingDates?'再点一个日期，自动选中两者之间的所有日期。':'点击查看当天记录，长按选择导出日期。';
 $('#selection-status').textContent=selectingDates?`${rangeStart} 至 ${rangeEnd}`:'';
 document.querySelectorAll('[data-quick-days]').forEach(b=>b.classList.toggle('active',Number(b.dataset.quickDays)===activeQuick));
 if(selectingDates){$('#history').innerHTML=reportHTML();return;}
 const list=records.filter(r=>dayKey(r.date)===reviewDay).sort((a,b)=>new Date(a.date)-new Date(b.date));
 $('#history').innerHTML=`<p class="subtext">${reviewDay} · ${list.length} 条记录</p>`+(list.length?list.map(r=>recordHTML(r,true)).join(''):'<p class="empty">这一天还没有记录。</p>');
}
$('#review-calendar').onclick=e=>{
 const month=e.target.closest('[data-review-month]');if(month){reviewMonth=new Date(reviewMonth.getFullYear(),reviewMonth.getMonth()+Number(month.dataset.reviewMonth),1);renderReview();}
 const day=e.target.closest('[data-review-day]');if(day){if(suppressDateClick===day.dataset.reviewDay){suppressDateClick=null;return;}suppressDateClick=null;activateDate(day.dataset.reviewDay);}
};
let pressTimer=null,pressOrigin=null,suppressDateClick=null;
const calendar=$('#review-calendar');
function cancelPress(){clearTimeout(pressTimer);pressTimer=null;pressOrigin=null;}
calendar.addEventListener('pointerdown',e=>{
 if(e.button!==0||e.isPrimary===false)return;
 const button=e.target.closest('[data-review-day]');if(!button)return;
 cancelPress();suppressDateClick=null;pressOrigin={x:e.clientX,y:e.clientY};
 const key=button.dataset.reviewDay;
 pressTimer=setTimeout(()=>{suppressDateClick=key;activateDate(key,true);cancelPress();},500);
});
calendar.addEventListener('pointermove',e=>{if(pressOrigin&&Math.hypot(e.clientX-pressOrigin.x,e.clientY-pressOrigin.y)>10)cancelPress();});
['pointerup','pointercancel','pointerleave'].forEach(type=>calendar.addEventListener(type,cancelPress));
calendar.addEventListener('contextmenu',e=>{if(e.target.closest('[data-review-day]'))e.preventDefault();});
calendar.addEventListener('keydown',e=>{const button=e.target.closest('[data-review-day]');if(button&&e.shiftKey&&(e.key==='Enter'||e.key===' ')){e.preventDefault();activateDate(button.dataset.reviewDay,true);}});
$('#select-dates').onclick=()=>{activeQuick=null;chooseRange(reviewDay,reviewDay);};
$('#cancel-selection').onclick=()=>{selectingDates=false;rangeAnchor=rangeStart=rangeEnd=null;activeQuick=null;$('#custom-range').hidden=true;renderReview();};
$('#selection-tools').addEventListener('click',e=>{
 const quick=e.target.closest('[data-quick-days]');
 if(quick){const end=new Date(),start=new Date();activeQuick=Number(quick.dataset.quickDays);start.setDate(start.getDate()-activeQuick+1);$('#custom-range').hidden=true;chooseRange(dayKey(start),dayKey(end));reviewMonth=new Date(end.getFullYear(),end.getMonth(),1);renderReview();}
 if(e.target.closest('[data-quick-custom]')){$('#custom-range').hidden=false;activeQuick=null;renderReview();}
});
function reportRecords(){const start=$('#report-start').value,end=$('#report-end').value;return records.filter(r=>dayKey(r.date)>=start&&dayKey(r.date)<=end).sort((a,b)=>new Date(a.date)-new Date(b.date));}
function reportHTML(){
 const start=$('#report-start').value,end=$('#report-end').value;
 if(!start||!end||start>end)return '<p class="empty">请选择有效的起止日期。</p>';
 const list=reportRecords(),days=[...new Set(list.map(r=>dayKey(r.date)))];
 return `<h2>此刻 · 个人记录</h2><p>${escapeHTML(start)} 至 ${escapeHTML(end)}</p><p>共 ${list.length} 条记录，记录覆盖 ${days.length} 天。</p><p class="report-explanation">以下为本人主动记录的当下体验，非诊断或临床量表。未评分不代表零程度，未记录不代表未发生；不同标签的程度不加总。</p>${days.map(day=>`<section class="report-day"><h3>${day}</h3>${list.filter(r=>dayKey(r.date)===day).map(recordHTML).join('')}</section>`).join('')||'<p class="empty">这段时间暂无记录。</p>'}`;
}
function renderReport(){if(selectingDates)$('#history').innerHTML=reportHTML();}
function updateCustomRange(){rangeStart=$('#report-start').value;rangeEnd=$('#report-end').value;rangeAnchor=rangeStart;activeQuick=null;renderReview();}
$('#report-start').onchange=updateCustomRange;$('#report-end').onchange=updateCustomRange;
$('#print-report').onclick=()=>{
 const start=$('#report-start').value,end=$('#report-end').value;
 if(!start||!end||start>end){toast('请检查起止日期');return;}
 if(!reportRecords().length){toast('这段时间暂无记录');return;}
 if(window.CikeAndroid){
  window.CikeAndroid.saveWord(JSON.stringify({start,end,records:reportRecords().map(r=>({...r,day:dayKey(r.date),time:new Date(r.date).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}),tags:r.tags.map(t=>({...t,symptom:!['活动','用药'].includes(categoryOf(t.name))&&t.name!=='平静'}))}))}));
  return;
 }
 let sheet=$('#print-sheet');if(!sheet){sheet=document.createElement('section');sheet.id='print-sheet';document.body.append(sheet);}
 sheet.innerHTML=reportHTML();window.print();
};
// Persist changes to the personal vocabulary independently of record submission.
$('#library').addEventListener('click',()=>persist());
$('#add-form').addEventListener('submit',()=>persist());
renderTags();renderReview();renderReport();

if(window.CikeAndroid)document.documentElement.classList.add('android-app');
window.cikeBack=()=>{
 const openDialog=document.querySelector('dialog[open]');if(openDialog){openDialog.close();return true;}
 if(!$('#record').hidden&&editingId!==null){$('#cancel-edit').onclick();return true;}
 if(!$('#export').hidden&&selectingDates){$('#cancel-selection').onclick();return true;}
 if(!$('#export').hidden){document.querySelector('[data-page="record"]').click();return true;}
 return false;
};

function composerSnapshot(){return {tags:[...selected],ratings:{...ratings},parts:[...occurrenceParts].map(([k,v])=>[k,[...v]]),notes:[...tagNotes],thoughts:[...thoughtSelections],occurred:$('#occurred').value,timeHidden:$('#time-field').hidden,expanded:expandedTag,legacy:$('#legacy-note').value};}
function restoreComposer(draft){
 selected.clear();draft.tags.forEach(t=>selected.add(t));Object.keys(ratings).forEach(k=>delete ratings[k]);Object.assign(ratings,draft.ratings);
 occurrenceParts.clear();draft.parts.forEach(([k,v])=>occurrenceParts.set(k,new Set(v)));tagNotes.clear();draft.notes.forEach(([k,v])=>tagNotes.set(k,v));
 thoughtSelections.clear();draft.thoughts.forEach(([k,v])=>thoughtSelections.set(k,v));expandedTag=draft.expanded;$('#occurred').value=draft.occurred;$('#time-field').hidden=draft.timeHidden;$('#legacy-note').value=draft.legacy;renderTags();
}
function finishEditing(){
 const draft=draftBeforeEdit;editingId=null;draftBeforeEdit=null;
 $('.moment-heading h2').textContent='这一刻';$('#save').innerHTML='记下 <span aria-hidden="true">↗</span>';$('#cancel-edit').hidden=true;$('#legacy-note-field').hidden=true;
 if(draft)restoreComposer(draft);
}
function localDateTime(value){const date=new Date(value);return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);}
function beginEditing(id){
 if(editingId!==null){toast('请先保存或取消正在修改的记录');showPage('record');return;}
 const record=records.find(r=>r.id===id);if(!record)return;
 draftBeforeEdit=composerSnapshot();editingId=id;
 const local=localDateTime(record.date);
 restoreComposer({tags:record.tags.map(t=>t.name),ratings:Object.fromEntries(record.tags.filter(t=>t.rating).map(t=>[t.name,t.rating])),parts:record.tags.map(t=>[t.name,t.parts||[]]),notes:record.tags.map(t=>[t.name,t.note||'']),thoughts:(record.thoughts||[]).map(t=>[t,true]),occurred:local,timeHidden:false,expanded:record.tags[0]?.name??null,legacy:record.note||''});
 $('.moment-heading h2').textContent='修改记录';$('#save').textContent='保存修改';$('#cancel-edit').hidden=false;$('#legacy-note-field').hidden=!record.note;showPage('record');$('#record-scroll').scrollTop=0;
}
$('#cancel-edit').onclick=()=>{if(editingId===null)return;finishEditing();showPage('export');};
function requestDelete(id){
 if(editingId===id){toast('请先保存或取消这条记录的修改');return;}
 const record=records.find(r=>r.id===id);if(!record)return;
 pendingDeleteId=id;$('#delete-preview').textContent=new Date(record.date).toLocaleString('zh-CN')+' · '+record.tags.map(t=>t.name).join('、');$('#delete-dialog').showModal();
}
function confirmDelete(){
 const index=records.findIndex(r=>r.id===pendingDeleteId);if(index<0)return;
 const [record]=records.splice(index,1);deletedRecords.push({record,deletedAt:new Date().toISOString()});
 if(!persist()){deletedRecords.pop();records.splice(index,0,record);return;}
 pendingDeleteId=null;$('#delete-dialog').close();renderReview();toast('已删除，可以撤销');
}
$('#confirm-delete').onclick=confirmDelete;
$('#cancel-delete').onclick=()=>{$('#delete-dialog').close();pendingDeleteId=null;};
$('#delete-dialog').addEventListener('close',()=>{pendingDeleteId=null;});
$('#undo-delete').onclick=()=>{
 const item=deletedRecords.pop();if(!item)return;
 records.unshift(item.record);if(!persist()){records.shift();deletedRecords.push(item);return;}
 const date=new Date(item.record.date);reviewDay=dayKey(date);reviewMonth=new Date(date.getFullYear(),date.getMonth(),1);selectingDates=false;renderReview();toast('记录已恢复');
};
document.addEventListener('click',e=>{
 const edit=e.target.closest('[data-edit-record]');if(edit)beginEditing(edit.dataset.editRecord);
 const remove=e.target.closest('[data-delete-record]');if(remove)requestDelete(remove.dataset.deleteRecord);
});
