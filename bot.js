'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Webhook validation
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);          
  }
});

// Display the web page
app.get('/', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('hi');
  res.end();
});

// Message processing
app.post('/webhook', (req, res) => {
  console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach((entry) => {
      // Iterate over each messaging event
      entry.messaging.forEach((event) => {
        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
          receivedPostback(event);   
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

// Incoming events handling
function receivedMessage(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  const messageId = message.mid;
  const messageText = message.text;
  const messageAttachments = message.attachments;

  if (messageText) {
    switch (messageText.toLowerCase()) {
      case 'menu':
        sendMenuMessage(senderID);
        break;
      case 'elephant':
        sendImageMessage(senderID);
        break;
     case 'draw again':
        sendImageMessage(senderID);
        break;
     case 'exit':
        sendTextMessage(senderID, 'Thanks for rocking out! Say MENU to play again.');
        break;
      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function receivedPostback(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfPostback = event.timestamp;
  const payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);
  sendImageMessage(senderID);
}

//////////////////////////
// Sending helpers
//////////////////////////
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
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
  callSendAPI(messageData);
}

function sendMenuMessage(recipientId) {
  const messageData = {
    recipient: {
      id: recipientId
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

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.FB_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const recipientId = body.recipient_id;
      const messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});
