const fs = require('fs');
const path = require('path');

async function test() {
  const formData = new FormData();
  
  // Create a blob from package.json for testing
  const buffer = fs.readFileSync(path.join(__dirname, 'package.json'));
  const blob = new Blob([buffer], { type: 'application/json' });
  
  formData.append('file', blob, 'package.json');
  formData.append('color', 'black');

  try {
    const res = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();
