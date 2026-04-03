exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let email;
  try { email = JSON.parse(event.body).email; } catch(e) { return { statusCode: 400, body: '{}' }; }
  if (!email || !email.includes('@')) return { statusCode: 400, body: '{}' };
  const KEY = 'xql1qv4ieo02o6ns5moozctxjn5qm9d27d7aa4qke23a3ecoi4x8p4harfeoin5i';
  const BASE = 'https://api.systeme.io/api';
  const H = { 'Content-Type': 'application/json', 'X-API-Key': KEY };
  let contactId = null;
  const r1 = await fetch(BASE+'/contacts', { method:'POST', headers:H, body:JSON.stringify({email,fields:[]}) });
  const b1 = await r1.json();
  console.log('CREATE', r1.status, JSON.stringify(b1));
  if (r1.status===201||r1.status===200) { contactId=b1.id; }
  else if (r1.status===409) {
    const r1b=await fetch(BASE+'/contacts?email='+encodeURIComponent(email),{headers:H});
    const b1b=await r1b.json();
    if(b1b.items&&b1b.items.length>0) contactId=b1b.items[0].id;
  }
  if (!contactId) return {statusCode:200,body:JSON.stringify({success:false,error:'no contactId'})};
  await new Promise(r=>setTimeout(r,500));
  const r2=await fetch(BASE+'/campaigns/1100238/subscriptions',{method:'POST',headers:H,body:JSON.stringify({contactId})});
  const b2=await r2.json();
  console.log('CAMPAIGN',r2.status,JSON.stringify(b2));
  if(r2.status===201||r2.status===200||r2.status===409) return {statusCode:200,body:JSON.stringify({success:true,contactId,method:'campaign'})};
  await new Promise(r=>setTimeout(r,500));
  const r3=await fetch(BASE+'/contacts/'+contactId+'/tags',{method:'POST',headers:H,body:JSON.stringify({tagId:1945526})});
  const b3=await r3.json();
  console.log('TAG',r3.status,JSON.stringify(b3));
  return {statusCode:200,body:JSON.stringify({success:true,contactId,method:'tag'})};
};