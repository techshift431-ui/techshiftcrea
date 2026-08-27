export async function onRequestGet({request,env}){
 if(!(await valid(request,env))) return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:{'Content-Type':'application/json'}});
 const {results}=await env.DB.prepare('SELECT id,type,data,created_at FROM submissions ORDER BY id DESC LIMIT 500').all();
 return new Response(JSON.stringify({results:results.map(r=>({...r,data:JSON.parse(r.data)}))}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}
async function valid(request,env){const c=request.headers.get('Cookie')||'';const m=c.match(/(?:^|; )tsc_admin=([^;]+)/);if(!m)return false;try{const raw=atob(m[1]);const i=raw.lastIndexOf('.');if(i<0)return false;const value=raw.slice(0,i), b64=raw.slice(i+1);if(!value.startsWith('admin:')||Date.now()>Number(value.slice(6)))return false;const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.ADMIN_SECRET||env.ADMIN_PASSWORD),{name:'HMAC',hash:'SHA-256'},false,['verify']);const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));return crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(value));}catch{return false;}}
