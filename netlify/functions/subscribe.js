exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let email;
  try { email = JSON.parse(event.body).email; } catch(e) { return { statusCode: 400, body: '{}' }; }
  if (!email || !email.includes('@')) return { statusCode: 400, body: '{}' };

  const KEY = 'xql1qv4ieo02o6ns5moozctxjn5qm9d27d7aa4qke23a3ecoi4x8p4harfeoin5i';
  const BASE = 'https://api.systeme.io/api';
  const H = { 'Content-Type': 'application/json', 'X-API-Key': KEY };

  // Step 1: Create or find contact
  let contactId = null;
  const r1 = await fetch(BASE+'/contacts', { method:'POST', headers:H, body:JSON.stringify({email,fields:[]}) });
  const b1 = await r1.text();
  console.log('CREATE status:', r1.status, 'body:', b1.substring(0,200));
  try {
    const j1 = JSON.parse(b1);
    if (r1.status===201||r1.status===200) contactId = j1.id;
  } catch(e) { console.log('CREATE parse error:', e.message); }

  if (r1.status===409) {
    const r1b = await fetch(BASE+'/contacts?email='+encodeURIComponent(email), { headers:H });
    const b1b = await r1b.text();
    console.log('SEARCH status:', r1b.status, 'body:', b1b.substring(0,200));
    try {
      const j1b = JSON.parse(b1b);
      if (j1b.items && j1b.items.length > 0) contactId = j1b.items[0].id;
    } catch(e) { console.log('SEARCH parse error:', e.message); }
  }

  if (!contactId) return { statusCode: 200, body: JSON.stringify({ success: false, error: 'no contactId' }) };
  console.log('contactId:', contactId);

  await new Promise(r => setTimeout(r, 800));

  // Step 2: Add optin tag (1945526)
  const r3 = await fetch(BASE+'/contacts/'+contactId+'/tags', { method:'POST', headers:H, body:JSON.stringify({tagId:1945526}) });
  const b3 = await r3.text();
  console.log('TAG status:', r3.status, 'body:', b3.substring(0,200));

  await new Promise(r => setTimeout(r, 800));

  // Step 3: Subscribe to campaign directly
  const r2 = await fetch(BASE+'/campaigns/1100238/subscriptions', { method:'POST', headers:H, body:JSON.stringify({contactId}) });
  const b2 = await r2.text();
  console.log('CAMPAIGN status:', r2.status, 'body:', b2.substring(0,200));

  return { statusCode: 200, body: JSON.stringify({ success: true, contactId, tagStatus: r3.status, campaignStatus: r2.status }) };
};