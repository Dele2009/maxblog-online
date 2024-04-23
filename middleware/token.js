const crypto = require('crypto');

// Generate a random token
const generateToken = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    // Generate a random buffer
    const buffer = crypto.randomBytes(5);

    // Convert the buffer to a string
    let randomString = '';
    for (let i = 0; i < buffer.length; i++) {
        // Get a random index within the range of characters
        const randomIndex = buffer.readUInt8(i) % characters.length;
        // Append the character at the random index to the string
        randomString += characters[randomIndex];
    }

    return randomString;
    // return crypto.randomBytes(32).toString('hex');

}

module.exports = {
    generateToken
}