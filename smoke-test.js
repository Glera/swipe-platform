// Quick smoke test script for localhost:3002
const https = require('http');

const testUrl = 'http://localhost:3002';

console.log('🧪 Starting smoke test for', testUrl);

// Test 1: Basic connectivity
https.get(testUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n✅ Server is responding (HTTP', res.statusCode, ')');
    
    // Test 2: Check HTML structure
    const hasRoot = data.includes('id="root"');
    const hasReactScript = data.includes('main.tsx') || data.includes('main.jsx');
    const hasVite = data.includes('@vite/client');
    
    console.log('\n📋 HTML Checks:');
    console.log('  - Root div present:', hasRoot ? '✅' : '❌');
    console.log('  - React entry point:', hasReactScript ? '✅' : '❌');
    console.log('  - Vite client:', hasVite ? '✅' : '❌');
    
    if (hasRoot && hasReactScript && hasVite) {
      console.log('\n✅ Basic HTML structure looks good');
      console.log('\n⚠️  Manual verification needed:');
      console.log('  - Open browser to', testUrl);
      console.log('  - Check UI renders (not blank/error)');
      console.log('  - Verify top bar with progress/events');
      console.log('  - Verify bottom button panel');
      console.log('  - Verify game field');
      console.log('  - Test opening/closing popups (collections/shop/leaderboard)');
      console.log('  - Check browser console for errors');
    } else {
      console.log('\n❌ HTML structure incomplete');
    }
  });
  
}).on('error', (err) => {
  console.error('\n❌ Connection failed:', err.message);
  console.log('Make sure the dev server is running on port 3002');
});
