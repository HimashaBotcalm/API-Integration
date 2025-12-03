const http = require('http');

console.log('🔍 Checking API Project Setup...\n');

// Check if backend is running
function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Backend server is running on port 5000');
        console.log('📊 Backend health:', JSON.parse(data).status);
        resolve(true);
      });
    });
    
    req.on('error', () => {
      console.log('❌ Backend server is NOT running on port 5000');
      console.log('💡 Run: cd Backend && npm run dev');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('⏰ Backend server timeout - may not be running');
      resolve(false);
    });
  });
}

// Check if frontend is running
function checkFrontend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5173', (res) => {
      console.log('✅ Frontend server is running on port 5173');
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('❌ Frontend server is NOT running on port 5173');
      console.log('💡 Run: cd Frontend && npm run dev');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('⏰ Frontend server timeout - may not be running');
      resolve(false);
    });
  });
}

async function main() {
  const backendRunning = await checkBackend();
  const frontendRunning = await checkFrontend();
  
  console.log('\n📋 Setup Summary:');
  console.log(`Backend (port 5000): ${backendRunning ? '✅ Running' : '❌ Not Running'}`);
  console.log(`Frontend (port 5173): ${frontendRunning ? '✅ Running' : '❌ Not Running'}`);
  
  if (backendRunning && frontendRunning) {
    console.log('\n🎉 Both servers are running! You can now:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Login with admin credentials to see the "Add Product" button');
  } else {
    console.log('\n🚨 To fix the issue:');
    if (!backendRunning) {
      console.log('1. Open terminal in Backend folder');
      console.log('2. Run: npm install');
      console.log('3. Run: npm run dev');
    }
    if (!frontendRunning) {
      console.log('1. Open terminal in Frontend folder');
      console.log('2. Run: npm install');
      console.log('3. Run: npm run dev');
    }
  }
}

main().catch(console.error);