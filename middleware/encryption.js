import  crypto  from 'crypto'


// Function to generate a shared key based on sender and receiver IDs
export const generateSharedKey = (senderId, receiverId) => {
    // Concatenate sender and receiver IDs
    const Ids = [senderId, receiverId].sort()

    const tipper = Ids.join('*')
    const combinedTip = [senderId, receiverId,tipper].sort()
    const specialKey = combinedTip.join("")

    // Use a secure hash function (e.g., SHA-256) to generate a key from the combined ID
    const sharedKey = crypto.createHash('sha256').update(specialKey).digest('hex');
    
    return sharedKey;
}

// Function to encrypt a message using the shared key
export const encryptMessage = (message, sharedKey) => {
    try {
        // Generate a random initialization vector
        const iv = crypto.randomBytes(16);

        // Create a cipher object with the AES-GCM algorithm
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(sharedKey, 'hex'), iv);

        // Encrypt the message
        let encryptedMessage = cipher.update(message, 'utf8', 'hex');
        encryptedMessage += cipher.final('hex');

        // Get the authentication tag
        const tag = cipher.getAuthTag();

        // Combine the IV, encrypted message, and authentication tag into a single string
        const combinedMessage = iv.toString('hex') + encryptedMessage + tag.toString('hex');

        return combinedMessage;
    } catch (error) {
        console.error('Error encrypting message:', error);
        throw error;
    }
}

// Function to decrypt a message using the shared key
export const decryptMessage = (encryptedMessage, sharedKey)=> {
    try {
        // Parse the encrypted message string
        const iv = Buffer.from(encryptedMessage.slice(0, 32), 'hex');
        const encryptedData = encryptedMessage.slice(32, -32);
        const tag = Buffer.from(encryptedMessage.slice(-32), 'hex');

        // Create a decipher object with the AES-GCM algorithm
        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(sharedKey, 'hex'), iv);

        // Set the authentication tag
        decipher.setAuthTag(tag);

        // Decrypt the message
        let decryptedMessage = decipher.update(encryptedData, 'hex', 'utf8');
        decryptedMessage += decipher.final('utf8');

        return decryptedMessage;
    } catch (error) {
        console.error('Error decrypting message:', error);
        throw error;
    }
}

