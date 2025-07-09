const https = require('https');

https.get('https://oauth2.googleapis.com/token', (res) => {
  console.log('Status code:', res.statusCode);
}).on('error', (err) => {
  console.error('Error:', err);
});
