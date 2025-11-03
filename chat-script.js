// WhatsApp-like Chat Interface - Interactive Script

document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatArea = document.querySelector('.chat-area');

    // Function to get current time in HH:MM format
    function getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Function to create a new message element
    function createMessageElement(text, type = 'sent') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = text;
        
        const messageTime = document.createElement('span');
        messageTime.className = 'message-time';
        messageTime.textContent = getCurrentTime();
        
        messageContent.appendChild(messageParagraph);
        messageContent.appendChild(messageTime);
        
        if (type === 'sent') {
            const checkMark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            checkMark.setAttribute('class', 'check-mark');
            checkMark.setAttribute('viewBox', '0 0 16 15');
            checkMark.setAttribute('width', '16');
            checkMark.setAttribute('height', '15');
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('fill', 'currentColor');
            path.setAttribute('d', 'M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z');
            
            checkMark.appendChild(path);
            messageContent.appendChild(checkMark);
        }
        
        messageDiv.appendChild(messageContent);
        return messageDiv;
    }

    // Function to send a message
    function sendMessage() {
        const messageText = messageInput.value.trim();
        
        if (messageText !== '') {
            const messageElement = createMessageElement(messageText, 'sent');
            chatArea.appendChild(messageElement);
            
            // Clear input
            messageInput.value = '';
            
            // Scroll to bottom
            chatArea.scrollTop = chatArea.scrollHeight;
            
            // Auto-reply after a delay (simulating a conversation)
            setTimeout(() => {
                const replies = [
                    'Que legal! 😊',
                    'Entendi!',
                    'Bacana!',
                    'Pode me falar mais sobre isso?',
                    'Interessante! 👍'
                ];
                const randomReply = replies[Math.floor(Math.random() * replies.length)];
                const replyElement = createMessageElement(randomReply, 'received');
                chatArea.appendChild(replyElement);
                chatArea.scrollTop = chatArea.scrollHeight;
            }, 1000 + Math.random() * 2000);
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Focus on input when page loads
    messageInput.focus();

    // Scroll to bottom on load
    chatArea.scrollTop = chatArea.scrollHeight;
});
