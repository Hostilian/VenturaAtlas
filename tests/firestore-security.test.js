const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test('Firestore Security Rules Contract Validation', t => {
  const rulesPath = path.join(__dirname, '..', 'firestore.rules');
  assert.ok(fs.existsSync(rulesPath), 'firestore.rules must exist');
  
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  assert.ok(rulesContent.includes("service cloud.firestore"), 'Must specify cloud.firestore service');
  assert.ok(rulesContent.includes("request.auth.uid"), 'Must enforce request.auth.uid authentication check');
  assert.ok(rulesContent.includes("request.auth.uid == uid"), 'Must prevent user vote forgery');
  assert.ok(rulesContent.includes("allow write: if false"), 'Must prevent arbitrary client mutation of publicAggregates');
  assert.ok(rulesContent.includes("validString(request.resource.data.body, 1000)"), 'Must bound comment string length to ≤1000 chars');
});
