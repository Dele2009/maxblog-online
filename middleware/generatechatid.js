const generateConversationId = (sender, receiver) => {
    const participants = [sender, receiver].sort();
    return participants.join('_');
}

module.exports= {
    generateConversationId
}