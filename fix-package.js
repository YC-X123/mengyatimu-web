const fs = require('fs');

const content = `{
  "name": "ai-quiz-client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ant-design/icons": "^5.5.1",
    "@reduxjs/toolkit": "^2.2.7",
    "antd": "^5.21.6",
    "axios": "^1.7.7",
    "react": "^18.3.1",
    "react-dom": "^18.3.0",
    "react-redux": "^9.1.2",
    "react-router-dom": "^6.27.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.8"
  }
}`;

fs.writeFileSync('client/package.json', content, 'utf8');
console.log('File written successfully without BOM!');
