exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let email;
  try { email = JSON.parse(event.body).email; } catch(e) { return { statusCode: 400, body: '{}' }; }
  if (!email || !email.includes('@')) return { statusCode: 400, body: '{}' };

  const KEY = 'xql1qv4ieo02o6ns5moozctxjn5qm9d27d7aa4qke23a3ecoi4x8p4harfeoin5i';
  const BASE = 'https://api.systeme.io/api';
  const H = { 'Content-Type': 'application/json', 'X-API-Key': KEY };

  // Step 1: Create contact
  let contactId = null;
  const r1 = await fetch(BASE+'/contacts', { method:'POST', headers:H, body:JSON.stringify({email,fields:[]}) });
  const b1 = await r1.text();
  console.log('CREATE', r1.status, b1.substring(0,200));
  try {
    const j = JSON.parse(b1);
    if (r1.status===200||r1.status===201) contactId = j.id;
  } catch(e) {}

  if (r1.status===409) {
    const r1b = await fetch(BASE+'/contacts?email='+encodeURIComponent(email), {headers:H});
    const b1b = await r1b.text();
    console.log('SEARCH', r1b.status, b1b.substring(0,200));
    try {
      const j = JSON.parse(b1b);
      if (j.items && j.items.length > 0) contactId = j.items[0].id;
    } catch(e) {}
  }

  if (!contactId) return { statusCode:200, body:JSON.stringify({success:false, error:'no contactId'}) };
  console.log('contactId:', contactId);

  // Step 2: Wait 3 seconds — critical for Systeme.io to register the contact before tagging
  await new Promise(r => setTimeout(r, 3000));

  // Step 3: Add optin tag — this triggers the automation rule
  const r2 = await fetch(BASE+'/contacts/'+contactId+'/tags', {
    method:'POST', headers:H, body:JSON.stringify({tagId:1945526})
  });
  const b2 = await r2.text();
  console.log('TAG', r2.status, b2.substring(0,200));

  return { statusCode:200, body:JSON.stringify({success:true, contactId, tagStatus:r2.status}) };
};