const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');

test('pins the bookmarklet script to a reviewed commit with SRI', () => {
  assert.match(readme, /@7fff1de\/calc\.js/);
  assert.doesNotMatch(readme, /@main\/calc\.js/);
  assert.match(readme, /s\.integrity='sha384-lhZHEZEdrJUnk8V7oXjBmQdSU7WPt6kW0vqh82y7BvhwAaE6pqyDDIoFUZYhrrHJ'/);
  assert.match(readme, /s\.crossOrigin='anonymous'/);
  assert.match(readme, /s\.referrerPolicy='no-referrer'/);
});
