'use strict';

const fb = require('./facebook');

function sendMenuMessage(recipientId) {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: 'Select a flash card.',
      quick_replies: [
        {
          content_type: 'text',
          title: 'Elephant',
          payload: 'Elephant',
        },
      ],
    },
  };  

  fb.sendMessage(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  fb.sendMessage(messageData);
}

function sendImageMessage(recipientId) {
  const url = 'http://dev-dadrock.pantheonsite.io/wp-content/uploads/2018/02/Image-uploaded-from-iOS-8-300x272.jpg';

  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      quick_replies: [
        {
          content_type: 'text',
          title: 'Draw again',
          payload: 'draw',
        },
        {
          content_type: 'text',
          title: 'Exit',
          payload: 'exit',
        },
      ],
      attachment: {
        type: 'image', 
        payload: {
          url, 
          is_reusable: true,
        },
      }
    }
  };
  fb.sendMessage(messageData);
}

module.exports = {
  sendImageMessage,
  sendMenuMessage,
  sendTextMessage,
};
