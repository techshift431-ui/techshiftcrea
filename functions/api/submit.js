export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    if (!body || !['brand','creator'].includes(body.type)) return json({error:'Invalid submission type'},400);
    const clean = sanitize(body);
    delete clean.type;
    const text = Object.entries(clean).map(([k,v])=>`${k}: ${v || '-'}`).join('\n');
    await env.DB.prepare('INSERT INTO submissions (type,data) VALUES (?,?)').bind(body.type, JSON.stringify(clean)).run();
    if (env.RESEND_API_KEY && env.NOTIFY_EMAIL) {
      const subject = body.type === 'brand' ? `New TechshiftCrea brand brief — ${clean.brand || 'New brand'}` : `New TechshiftCrea creator application — ${clean.name || 'New creator'}`;
      await fetch('https://api.resend.com/emails', {
        method:'POST', headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},
        body:JSON.stringify({from:env.FROM_EMAIL || 'TechshiftCrea <onboarding@resend.dev>',to:[env.NOTIFY_EMAIL],subject,text})
      });
    }
    return json({ok:true},200);
  } catch(e) { return json({error:'Submission failed'},500); }
}
function sanitize(input){
 const out={}; for(const [k,v] of Object.entries(input)){ if(k==='type') continue; out[k]=String(v ?? '').slice(0,4000); } return out;
}
function json(o,status){ return new Response(JSON.stringify(o),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}); }
