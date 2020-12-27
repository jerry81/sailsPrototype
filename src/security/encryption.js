const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const iv = 'abcdefg'

function iterateObject(x, password, functionKey) {
    const shallowClone = {...x}
    Object.entries(shallowClone).map(keyVal => {
        const [key, val] = keyVal
        if (val) {
            const processed = functionKey.call(null, val, password)
            shallowClone[key] = processed
        }
    })
    return shallowClone
}

function decryptObject(x, password) {
    return iterateObject(x, password, decrypt)
}

function encryptObject(x, password) {
    return iterateObject(x, password, encrypt)
}

function encrypt(text, key) {
    if (!key) return
 let cipher = crypto.createCipher(algorithm, Buffer.from(key));
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return { encryptedData: encrypted.toString('hex') };
}

function decrypt(text, key) {
    if (!text.encryptedData) return text
    if (!key) return 'cannot decrypt'
 let encryptedText = Buffer.from(text.encryptedData, 'hex');
 let decipher = crypto.createDecipher('aes-256-cbc', Buffer.from(key));
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}

module.exports = {encrypt, decrypt, encryptObject, decryptObject}