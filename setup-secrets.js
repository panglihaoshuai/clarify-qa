const https = require('https');
const crypto = require('crypto');

const GITHUB_TOKEN = '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';
const REPO = 'panglihaoshuai/clarify-qa';

const SECRETS = {
  RAILWAY_TOKEN: '5eed9870-119c-466e-86d8-5e292db28d7e',
  RAILWAY_PROJECT_ID: '5a047410-00b3-467a-877c-9fdcf92b655a',
  DATABASE_URL: 'postgresql://postgres:HeXoGGKHJNaTkgdZmSUgWaZaszpKPKyC@postgres.railway.internal:5432/railway',
  JWT_SECRET: 'hxZEX/7f1Q30s1vcLC+l87A1BVTQMu5RGz0aZWBOJCc=',
  MINIMAX_API_URL: 'https://api.minimax.chat',
};

function githubApi(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'clarify-qa-deploy',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve(d); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function publicKeyEncrypt(pubKeyPem, plaintext) {
  const key = crypto.createPublicKey(pubKeyPem);
  const encrypted = crypto.publicEncrypt(
    { key, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    Buffer.from(plaintext, 'utf8')
  );
  return encrypted.toString('base64');
}

async function setup() {
  // Get public key for secret encryption
  const pkData = await githubApi('GET', `/repos/${REPO}/actions/secrets/public-key`);
  const keyId = pkData.key_id;
  const key = pkData.key;

  // Create public key PEM from base64
  const pubKeyPem = crypto.createPublicKey({
    key: Buffer.from(key, 'base64'),
    format: 'der',
    type: 'spki',
  }).export({ type: 'spki', format: 'pem' }).toString();

  // Set each secret
  for (const [name, value] of Object.entries(SECRETS)) {
    const encrypted = publicKeyEncrypt(pubKeyPem, value);
    await githubApi('PUT', `/repos/${REPO}/actions/secrets/${name}`, {
      encrypted_value: encrypted,
      key_id: keyId,
    });
    console.log(`✅ Set ${name}`);
  }
  console.log('\n🎉 All GitHub Secrets configured!');
}

setup().catch(console.error);
