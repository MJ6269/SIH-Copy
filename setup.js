const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Mumbai University ABC App...\n');

// Create necessary directories
const directories = [
  'server/uploads',
  'server/uploads/activities'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`📁 Directory already exists: ${dir}`);
  }
});

// Create .env files if they don't exist
const envFiles = [
  {
    source: 'server/env.example',
    target: 'server/.env',
    name: 'Server Environment'
  },
  {
    source: 'client/env.example', 
    target: 'client/.env',
    name: 'Client Environment'
  }
];

envFiles.forEach(({ source, target, name }) => {
  if (!fs.existsSync(target)) {
    fs.copyFileSync(source, target);
    console.log(`✅ Created ${name} file: ${target}`);
  } else {
    console.log(`📄 ${name} file already exists: ${target}`);
  }
});

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Install dependencies: npm run install-all');
console.log('2. Start MongoDB (if using local)');
console.log('3. Run the application: npm run dev');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n🔧 Configuration:');
console.log('- Firebase is already configured with your project');
console.log('- Gemini AI is configured for portfolio generation');
console.log('- MongoDB will use localhost:27017/abc_app by default');
console.log('- Update server/.env if you need different MongoDB settings');
console.log('\n📚 For detailed setup instructions, see README.md');
