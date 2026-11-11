const allQuestions = window.CEJM_QUESTIONS || [];
const $ = id => document.getElementById(id);
let currentLevel = 1, currentQuestion = 0, answers = {}, flashFilter = "all", flashIndex = 0, flashPool = [...allQuestions], flashFlipped = false;
const levelNames = {1:"LES BASES",2:"COMPRENDRE",3:"APPROFONDIR"};
const letters = ["A","B","C","D"];
const key = (q) => `${q.level}-${q.id}`;
function levelQuestions(){return allQuestions.filter(q=>q.level===currentLevel)}
function renderQuiz(){
 const qs=levelQuestions(), q=qs[currentQuestion]; if(!q)return;
 $("questionLevel").textContent=`NIVEAU ${currentLevel} · ${levelNames[currentLevel]}`;
 $("questionIndex").textContent=`QUESTION ${String(currentQuestion+1).padStart(2,"0")} / 20`;
 $("questionText").textContent=q.question;
 $("answers").innerHTML="";
 const chosen=answers[key(q)];
 q.options.forEach((opt,i)=>{
   const b=document.createElement("button"); b.className="answer-option"; b.type="button";
   if(chosen!==undefined){if(i===q.answer)b.classList.add("correct");else if(i===chosen)b.classList.add("incorrect");b.disabled=true;}
   if(chosen===i)b.classList.add("selected");
   b.innerHTML=`<span class="answer-letter">${letters[i]}</span><span></span>`;b.querySelector("span:last-child").textContent=opt;
   b.addEventListener("click",()=>{if(answers[key(q)]===undefined){answers[key(q)]=i;renderQuiz();updateProgress();}});
   $("answers").appendChild(b);
 });
 const feedback=$("feedback");
 if(chosen!==undefined){feedback.className=`feedback ${chosen===q.answer?"good":"bad"}`;feedback.innerHTML=`<strong>${chosen===q.answer?"✓ Bonne réponse !":"✕ Pas tout à fait."}</strong>${chosen===q.answer?"":"La bonne réponse était : "+q.options[q.answer]+". "}${q.explanation}`;}
 else {feedback.className="feedback hidden";feedback.textContent="";}
 $("prevQuestion").disabled=currentQuestion===0;$("nextQuestion").textContent=currentQuestion===19?"Terminer le niveau ✓":"Suivante →";
 $("questionGrid").innerHTML="";
 qs.forEach((item,i)=>{const b=document.createElement("button");b.className="q-dot"+(i===currentQuestion?" current":"")+(answers[key(item)]!==undefined?(answers[key(item)]===item.answer?" correct":" wrong"):"");b.textContent=i+1;b.title=`Question ${i+1}`;b.addEventListener("click",()=>{currentQuestion=i;renderQuiz();});$("questionGrid").appendChild(b);});
 const done=qs.filter(item=>answers[key(item)]!==undefined).length;
 $("levelProgress").style.width=(done/20*100)+"%";$("levelProgressText").textContent=`${done} / 20 questions répondues`;
}
function updateProgress(){
 const done=Object.keys(answers).length, correct=allQuestions.filter(q=>answers[key(q)]===q.answer).length;
 $("globalProgress").style.width=(done/60*100)+"%";$("globalDone").textContent=`${done} / 60 répondues`;
 $("scoreSummary").textContent=done?`${correct} bonne(s) réponse(s) sur ${done}`:"Aucune réponse pour le moment";
 renderQuiz();
}
$("quizLevels").addEventListener("click",e=>{const b=e.target.closest("[data-level]");if(!b)return;currentLevel=Number(b.dataset.level);currentQuestion=0;document.querySelectorAll(".level-tab").forEach(x=>x.classList.toggle("selected",x===b));renderQuiz();});
$("prevQuestion").addEventListener("click",()=>{if(currentQuestion>0){currentQuestion--;renderQuiz();}});
$("nextQuestion").addEventListener("click",()=>{if(currentQuestion<19){currentQuestion++;renderQuiz();}else{const next=currentLevel<3?currentLevel+1:1;if(currentLevel<3){currentLevel=next;currentQuestion=0;document.querySelectorAll(".level-tab").forEach(x=>x.classList.toggle("selected",Number(x.dataset.level)===next));renderQuiz();}else{currentQuestion=0;renderQuiz();}}});
$("resetLevel").addEventListener("click",()=>{if(confirm("Effacer les réponses de ce niveau et recommencer ?")){levelQuestions().forEach(q=>delete answers[key(q)]);currentQuestion=0;updateProgress();}});
function refreshFlashPool(){
 const search=$("flashSearch").value.trim().toLocaleLowerCase("fr");
 flashPool=allQuestions.filter(q=>(flashFilter==="all"||q.level===Number(flashFilter))&&(!search||(q.question+" "+q.explanation+" "+q.options[q.answer]).toLocaleLowerCase("fr").includes(search))&&(!$("onlyUnknown").checked||!known.has(q.id)));
 flashIndex=0;renderFlash();
}
const known=new Set();
function renderFlash(){
 if(!flashPool.length){$("flashQuestion").textContent="Aucune carte ne correspond à ta recherche."; $("flashAnswer").textContent="";$("flashExplanation").textContent="Modifie les filtres pour afficher des cartes."; $("flashCounter").textContent="0 / 0";$("flashCard").classList.remove("flipped");$("markKnown").disabled=true;return;}
 $("markKnown").disabled=false;const q=flashPool[flashIndex];flashFlipped=false;$("flashCard").classList.remove("flipped");
 $("flashLevel").textContent=`NIVEAU ${q.level} · ${levelNames[q.level]}`;$("flashQuestion").textContent=q.question;
 $("flashAnswer").textContent=q.options[q.answer];$("flashExplanation").textContent=q.explanation;
 $("flashAnswerNumber").textContent=`${String(q.id).padStart(2,"0")} / 60`;
 $("flashCounter").textContent=`${flashIndex+1} / ${flashPool.length}`;
 $("flashStatus").textContent=known.has(q.id)?"✓ Carte maîtrisée":"Carte non maîtrisée";
 $("markKnown").textContent=known.has(q.id)?"✓ Maîtrisée":"✓ Je maîtrise cette carte";
 $("markKnown").classList.toggle("done",known.has(q.id));
}
function flip(){if(!flashPool.length)return;flashFlipped=!flashFlipped;$("flashCard").classList.toggle("flipped",flashFlipped);}
$("flashCard").addEventListener("click",flip);$("flashCard").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();flip();}});
$("flipFlash").addEventListener("click",flip);
$("flashPrev").addEventListener("click",()=>{if(flashPool.length){flashIndex=(flashIndex-1+flashPool.length)%flashPool.length;renderFlash();}});
$("flashNext").addEventListener("click",()=>{if(flashPool.length){flashIndex=(flashIndex+1)%flashPool.length;renderFlash();}});
$("markKnown").addEventListener("click",()=>{if(!flashPool.length)return;const id=flashPool[flashIndex].id;if(known.has(id))known.delete(id);else known.add(id);renderFlash();updateProgress();});
$("flashFilters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;flashFilter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));refreshFlashPool();});
$("flashSearch").addEventListener("input",refreshFlashPool);$("onlyUnknown").addEventListener("change",refreshFlashPool);
$("menuToggle").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach(a=>a.addEventListener("click",()=>{$("mainNav").classList.remove("open");document.querySelectorAll(".nav-link").forEach(x=>x.classList.toggle("active",x===a));}));
renderQuiz();updateProgress();renderFlash();