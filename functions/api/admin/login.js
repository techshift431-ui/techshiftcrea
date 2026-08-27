export async function onRequestPost({request,env}){
 const {password}=await request.json().catch(()=>({}));
 if(!password || !env.ADMIN_PASSWORD || password!==env.ADMIN_PASSWORD) return new Response(JSON.stringify({error:'Invalid password'}),{status:401,headers:{'Content-Type':'application/json'}});
 const token=await sign(`admin:${Date.now()+86400000}`,env.ADMIN_SECRET||env.ADMIN_PASSWORD);
 return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Set-Cookie':`tsc_admin=${token}; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict`}});
}
async function sign(value,secret){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value));return btoa(value+'.'+[...new Uint8Array(sig)].map(x=>String.fromCharCode(x)).join(''));}
