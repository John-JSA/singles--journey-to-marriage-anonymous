import {createHash,randomUUID} from 'node:crypto';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
class SetupError extends Error {}
async function database(table:string,query='',method='GET',body?:unknown){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;
 if(!url||!key)throw new SetupError('Database setup is incomplete. Add SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel, then redeploy.');
 const res=await fetch(`${url.replace(/\/$/,'')}/rest/v1/${table}?${query}`,{method,cache:'no-store',headers:{apikey:key,...(key.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${key}`}), 'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
 if(!res.ok){const problem=await res.json().catch(()=>({})) as {code?:string};if(res.status===409&&problem.code==='23505')return [];throw new Error('Database request failed');}
 const text=await res.text();return text?JSON.parse(text):[];
}
const eq=(v:unknown)=>encodeURIComponent(String(v));
async function roomFor(code:string){return(await database('sjm_rooms',`code=eq.${eq(code)}&select=code,title,open,secret`))[0];}
export async function GET(req:Request){try{const code=(new URL(req.url).searchParams.get('code')||'').toUpperCase();if(!/^[A-F0-9]{8}$/.test(code))return reply({error:'Room not found. Check your code.'},404);const room=await roomFor(code);if(!room)return reply({error:'Room not found. Check your code.'},404);const host=hash(req.headers.get('authorization')||'')===room.secret;const questions=await database('sjm_question_board',`room=eq.${code}&select=id,body,status,answer,created,votes&order=created.desc&limit=500`);return reply({room:{code,title:room.title,open:room.open},host,questions});}catch(e){return reply({error:e instanceof SetupError?e.message:'Unable to load the room. Please try again.'},503)}}
export async function POST(req:Request){try{if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Invalid request.'},403);const b=await req.json() as Record<string,unknown>;if(b.action==='create'){const title=String(b.title||'').trim();if(!title||title.length>100)return reply({error:'Enter an event name (up to 100 characters).'},400);const code=randomUUID().replace(/-/g,'').slice(0,8).toUpperCase(),key=randomUUID()+randomUUID();await database('sjm_rooms','','POST',{code,title,secret:hash(key)});return reply({code,key});}
const code=String(b.code||'').toUpperCase();if(!/^[A-F0-9]{8}$/.test(code))return reply({error:'Room not found.'},404);const room=await roomFor(code);if(!room)return reply({error:'Room not found.'},404);const host=hash(req.headers.get('authorization')||'')===room.secret;
if(b.action==='ask'){const body=String(b.body||'').trim();if(!room.open)return reply({error:'Questions are paused for this room.'},400);if(body.length<5||body.length>600)return reply({error:'Please write between 5 and 600 characters.'},400);const recent=await database('sjm_questions',`room=eq.${code}&created=gt.${Date.now()-60000}&select=id&limit=30`);if(recent.length>=30)return reply({error:'This room is busy. Try again in a minute.'},429);await database('sjm_questions','','POST',{id:randomUUID(),room:code,body,created:Date.now(),status:'approved'});return reply({ok:true});}
if(b.action==='vote'){if(!/^[a-f0-9-]{36}$/.test(String(b.token||''))||! /^[a-f0-9-]{36}$/.test(String(b.id||'')))return reply({error:'Invalid vote.'},400);const q=await database('sjm_questions',`id=eq.${eq(b.id)}&room=eq.${code}&select=id`);if(!q.length)return reply({error:'Question unavailable.'},404);await database('sjm_votes','','POST',{id:hash(String(b.id)+String(b.token)),question:b.id});return reply({ok:true});}
if(!host)return reply({error:'Host access required. Use your saved private host link.'},403);
if(b.action==='pause'){await database('sjm_rooms',`code=eq.${code}`,'PATCH',{open:!room.open});}
else if(b.action==='moderate'){if(b.status!=='answered')return reply({error:'Questions cannot be hidden. Hosts may publish answers.'},400);const answer=String(b.answer||'').trim();if(!answer||answer.length>2000)return reply({error:'Write an answer between 1 and 2,000 characters.'},400);const changed=await database('sjm_questions',`id=eq.${eq(b.id)}&room=eq.${code}`,'PATCH',{status:'answered',answer});if(!changed.length)return reply({error:'Question unavailable.'},404);}
else return reply({error:'Unknown action.'},400);return reply({ok:true});
}catch(e){return reply({error:e instanceof SetupError?e.message:'Unable to save. Please try again.'},503)}}
