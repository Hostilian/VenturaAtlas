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

test('Firestore Security Rules preserve explicit room membership and content boundaries', () => {
  const rulesPath = path.join(__dirname, '..', 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  assert.match(rulesContent, /allow read:\s*if isAuthenticated\(\) && \(isMember\(roomId\) \|\| resource\.data\.ownerUid == request\.auth\.uid\);/);
  assert.match(rulesContent, /allow create:\s*if isAuthenticated\(\) &&\s+validString\(request\.resource\.data\.name, 100\)\s+&&\s+request\.resource\.data\.ownerUid == request\.auth\.uid;/);
  assert.match(rulesContent, /allow write:\s*if isAuthenticated\(\) && request\.auth\.uid == uid && validString\(request\.resource\.data\.displayName, 50\);/);
  assert.match(rulesContent, /allow write:\s*if isMember\(roomId\) && request\.resource\.data\.uid == request\.auth\.uid;/);
  assert.match(rulesContent, /allow create:\s*if isMember\(roomId\) &&\s+request\.resource\.data\.uid == request\.auth\.uid &&\s+validString\(request\.resource\.data\.body, 1000\);/);
  assert.match(rulesContent, /allow delete:\s*if isMember\(roomId\) && resource\.data\.uid == request\.auth\.uid;/);
});
