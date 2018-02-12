'use strict';

const fb = require('./facebook');

function getDefaultPayloadForRecipientId(recipientId) {
  return {
    recipient: {
      id: recipientId,
    },
  };
}

function sendMenuMessage(recipientId) {
  const data = getDefaultPayloadForRecipientId(recipientId);
  data.message = { 
    text: 'Select a flash card.',
    quick_replies: [
      {
        content_type: 'text',
        title: 'Elephant',
        payload: 'Elephant',
      },
    ],
  };

  fb.sendMessage(data);
}

function sendExitMessage(recipientId) {
  const data = getDefaultPayloadForRecipientId(recipientId);
  data.message = {
    text: 'Have fun! Send back Menu if you want to play again.',
    quick_replies: [
      {
        content_type: 'text',
        title: 'Menu',
        payload: 'menu',
      },
    ],
  };  

  fb.sendMessage(data);
}

function sendTextMessage(recipientId, messageText) {
  const data = getDefaultPayloadForRecipientId(recipientId);
  data.message = { text: messageText };

  fb.sendMessage(data);
}

function sendImageMessage(recipientId) {
  const url = 'http://dev-dadrock.pantheonsite.io/wp-content/uploads/2018/02/Image-uploaded-from-iOS-8-300x272.jpg';

  const data = getDefaultPayloadForRecipientId(recipientId);
  data.message = {
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
    },
  };
  fb.sendMessage(data);
}

module.exports = {
  sendExitMessage,
  sendImageMessage,
  sendMenuMessage,
  sendTextMessage,
};
