#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Homeless Aid Platform Setup...\n');

let allGood = true;

// Check 1: Service worker file exists
const swPath = path.join(__dirname, 'public', 'mockServiceWorker.js');
if (fs.existsSync(swPath)) {
  console.log('✅ Service worker file exists');
} else {
  console.log('❌ Service worker file MISSING');
  console.log('   Run: npx msw init public/ --save');
  allGood = false;
}

// Check 2: MSW Provider exists
const mswProviderPath = path.join(__dirname, 'components', 'MSWProvider.tsx');
if (fs.existsSync(mswProviderPath)) {
  console.log('✅ MSWProvider component exists');
} else {
  console.log('❌ MSWProvider component MISSING');
  allGood = false;
}

// Check 3: Handlers exist
const handlersPath = path.join(__dirname, 'mocks', 'handlers', 'index.ts');
if (fs.existsSync(handlersPath)) {
  const handlersContent = fs.readFileSync(handlersPath, 'utf8');
  if (handlersContent.includes('shelterMedicalHandlers')) {
    console.log('✅ Medical handlers registered');
  } else {
    console.log('❌ Medical handlers NOT registered');
    allGood = false;
  }
} else {
  console.log('❌ Handlers index file MISSING');
  allGood = false;
}

// Check 4: Browser setup exists
const browserPath = path.join(__dirname, 'mocks', 'browser.ts');
if (fs.existsSync(browserPath)) {
  console.log('✅ Browser setup exists');
} else {
  console.log('❌ Browser setup MISSING');
  allGood = false;
}

// Check 5: API functions exist
const apiPath = path.join(__dirname, 'lib', 'api.ts');
if (fs.existsSync(apiPath)) {
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  if (apiContent.includes('scheduleFollowup') && apiContent.includes('markFollowupCompleted')) {
    console.log('✅ Follow-up API functions exist');
  } else {
    console.log('❌ Follow-up API functions MISSING');
    allGood = false;
  }
} else {
  console.log('❌ API file MISSING');
  allGood = false;
}

// Check 6: Types exist
const typesPath = path.join(__dirname, 'lib', 'types.ts');
if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  if (typesContent.includes('MedicalFollowup')) {
    console.log('✅ MedicalFollowup type exists');
  } else {
    console.log('❌ MedicalFollowup type MISSING');
    allGood = false;
  }
} else {
  console.log('❌ Types file MISSING');
  allGood = false;
}

// Check 7: Package.json has MSW
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (packageContent.dependencies?.msw || packageContent.devDependencies?.msw) {
    console.log('✅ MSW package installed');
  } else {
    console.log('❌ MSW package NOT installed');
    console.log('   Run: npm install msw');
    allGood = false;
  }
} else {
  console.log('❌ package.json MISSING');
  allGood = false;
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\nNext steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Open browser: http://localhost:3001');
  console.log('3. Clear browser cache (F12 → Application → Clear site data)');
  console.log('4. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)');
  console.log('5. Check console for: [MSW] ✅ Mocking enabled successfully!');
  console.log('\nTest page: http://localhost:3001/test-msw.html');
} else {
  console.log('❌ SOME CHECKS FAILED!');
  console.log('\nFix the issues above, then run this script again.');
}

console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);
