// DNS‐resolution test for oauth2.googleapis.com
const dns = require('dns');

dns.lookup('oauth2.googleapis.com', (err, address, family) => {
    console.log('lookup:', err || `${address} (IPv${family})`);
});

dns.resolve4('oauth2.googleapis.com', (err, addrs) => {
    console.log('resolve4:', err || addrs);
});

dns.resolve6('oauth2.googleapis.com', (err, addrs) => {
    console.log('resolve6:', err || addrs);
});

