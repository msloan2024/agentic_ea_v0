const crypto = require('crypto');
const fs = require('fs');

const secretEncryptionKey = fs.readFileSync('/run/secrets/secret_encryption_key', 'utf8').trim();
const algorithm = 'aes-256-gcm'; 

function encrypt(text) {
    const iv = crypto.randomBytes(12); // 12 bytes is recommended for GCM
    const cipher = crypto.createCipheriv(algorithm, secretEncryptionKey, iv, {
        authTagLength: 16
    });
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return {
        iv: iv.toString('hex'),
        authTag,
        content: encrypted
    };
}

function decrypt(encryptedData) {

    const decipher = crypto.createDecipheriv(
        algorithm, 
        secretEncryptionKey, 
        Buffer.from(encryptedData.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    let decrypted = decipher.update(encryptedData.client_key, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };