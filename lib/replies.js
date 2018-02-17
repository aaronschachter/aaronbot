'use strict';

const fb = require('./facebook');

const cards = {
  bear: 'http://dev-dadrock.pantheonsite.io/wp-content/uploads/84B2F7E9-7487-4BA8-9908-80D40BFC17A2-297x300.jpeg',
  dog: 'http://dev-dadrock.pantheonsite.io/wp-content/uploads/95871B34-25C8-4751-90EA-BA720F3FD0C1-296x300.jpeg',
  elephant: 'http://dev-dadrock.pantheonsite.io/wp-content/uploads/3B75126A-5E1C-4DCE-8958-30245E9D1FCC-300x276.jpeg',
};

function addQuickReplies(data) {
  return Object.keys(cards).map((cardName) => {
    return {
      content_type: 'text',
      title: cardName,
      payload: cardName,
    };
  });
}

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
    quick_replies: addQuickReplies(),
  };
  fb.sendMessage(data);
}

function sendTextMessage(recipientId, messageText) {
  const data = getDefaultPayloadForRecipientId(recipientId);
  data.message = { text: messageText };

  fb.sendMessage(data);
}

function sendFlashCardMessage(recipientId, messageText) {
  let url = 'http://dev-dadrock.pantheonsite.io/wp-content/uploads/2018/02/Image-uploaded-from-iOS-8-300x272.jpg';
  if (cards[messageText]) {
    url = cards[messageText];
  }
  const data = getDefaultPayloadForRecipientId(recipientId);
  if (cards[messageText]) {
    data.message = {
      attachment: {
        type: 'image', 
        payload: {
          url, 
          is_reusable: true,
        },
      },
      quick_replies: addQuickReplies(),
    };
  } else {
    data.message = {
      text: 'I am just a bot. Send MENU to select a flash card.',
    };
  }
  fb.sendMessage(data);
}

module.exports = {
  sendFlashCardMessage,
  sendMenuMessage,
  sendTextMessage,
};
