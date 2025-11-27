// ---------- Utilities ----------
let allowedUsers = [];
const insults = [
  "Nice try, but no.","Your mother was a hamster and your father smelt of elderberries!",
  "Are you even trying?","This mission is too important to allow you to jeopardize it.",
  "Calibrate your enthusiasm.","I've seen penguins that can type better than that.",
  "Stop wasting your time.","He has fallen in the water!","Don't give up your day job!",
  "Hold it up to the light - not a brain in sight!","You silly, twisted boy you.",
  "We'll all be murdered in our beds!","Wrong! You cheating scum!","Are you on drugs?",
  "My pet ferret can type better than you!","Your mind just hasn't been the same since the electro-shock, has it?",
  "Maybe if you used more than just two fingers...","I think ... err ... I think ... I think I'll go home.",
  "There must be a cure for it!","You'll starve!","I can't hear you - I'm using the scrambler.",
  "And you call yourself a Rocket Scientist!","BOB says:  You seem to have forgotten your passwd, enter another!",
  "stty: unknown mode: doofus","Speak English, you fool - there are no subtitles in this scene!"
];
function getRandomInsult(){return insults[Math.floor(Math.random()*insults.length)];}
function sanitizeInput(str,maxLength=50){ const temp=document.createElement('div'); temp.textContent=str; return temp.innerHTML.trim().slice(0,maxLength); }
function showSanitizerWarning(){ const id='sanitizer-warning'; let el=document.getElementById(id); if(!el){ el=document.createElement('div'); el.id=id; el.style.position='fixed'; el.style.right='16px'; el.style.bottom='16px'; el.style.background='rgba(20,20,20,0.95)'; el.style.color='#ff6b6b'; el.style.padding='10px 14px'; el.style.border='1px solid #ff4d4d'; el.style.borderRadius='8px'; el.style.zIndex=9999; el.style.fontFamily='Silkscreen, monospace, sans-serif'; document.body.appendChild(el); } el.textContent='Are you trying to do code injection? Try harder, script kiddie!'; el.style.display='block'; clearTimeout(el._hideTimer); el._hideTimer=setTimeout(()=>{el.style.display='none';},6000);}

// ---------- Hash helpers ----------
function buf2b64(buf){ let s=''; for(let i=0;i<buf.length;i++) s+=String.fromCharCode(buf[i]); return btoa(s); }
async function hashString(str,salt){ const enc=new TextEncoder(); const key=await crypto.subtle.importKey('raw',enc.encode(str),{name:'PBKDF2'},false,['deriveBits']); const buf=await crypto.subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:100000,hash:'SHA-256'},key,256); return buf2b64(new Uint8Array(buf)); }
async function sha256B64(str){ const enc=new TextEncoder(); const buf=await crypto.subtle.digest('SHA-256',enc.encode(str)); return buf2b64(new Uint8Array(buf)); }

// ---------- Load allowed users ----------
async function loadAllowedUsers(){ try{ const res=await fetch('/data/a83wk4.b64',{cache:'no-store'}); if(!res.ok) throw new Error('Cannot load'); const json=JSON.parse(atob(await res.text())); allowedUsers=json; }catch(e){ allowedUsers=[]; console.error(e);}}

// ---------- Verify login ----------
async function verifyLogin(user,pass){
  for(const u of allowedUsers){
    const saltU=Uint8Array.from(atob(u.saltUserB64),c=>c.charCodeAt(0));
    const saltP=Uint8Array.from(atob(u.saltB64),c=>c.charCodeAt(0));
    const uh=await hashString(user,saltU);
    const ph=await hashString(pass,saltP);
    if(uh===u.hashUserB64 && ph===u.hashB64) return {ok:true,uh,ph};
  }
  return {ok:false};
}

// ---------- Tokens ----------
async function generateToken(uh,ph,days=30){ const payload={uh,ph,exp:Date.now()+days*24*60*60*1000}; const b64=btoa(JSON.stringify(payload)); const sig=await sha256B64(`${b64}:${uh}:${ph}`); return `${b64}.${sig}`; }

// ---------- DOM Logic ----------
document.addEventListener('DOMContentLoaded',async()=>{
    await loadAllowedUsers();
    const form=document.getElementById('login-form');
    const loginError=document.getElementById('login-error');

    form.addEventListener('submit', async e=>{
        e.preventDefault();
        const user=document.getElementById('username').value.trim();
        const pass=document.getElementById('password').value;
        if(sanitizeInput(user)!==user||sanitizeInput(pass)!==pass){ showSanitizerWarning(); loginError.textContent='Invalid characters.'; loginError.style.display='block'; return; }
        const res=await verifyLogin(user,pass);
        if(res.ok){
            const token=await generateToken(res.uh,res.ph,30);
            localStorage.setItem('loginToken',token);
            window.location.href='/index.html';
        } else {
            loginError.textContent=getRandomInsult(); loginError.style.display='block';
        }
    });
});