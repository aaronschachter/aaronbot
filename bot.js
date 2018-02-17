'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');

const replies = require('./lib/replies');

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

// Inbound message
app.post('/webhook', (req, res) => {
  console.log(req.body);
  const data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    data.entry.forEach((entry) => {
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
    const input = messageText.toLowerCase();
    switch (input) {
      case 'menu':
        return replies.sendMenuMessage(senderID);

     case 'exit':
        return replies.sendExitMessage(senderID);

      default:
        return replies.sendFlashCardMessage(senderID, input);
    }
  } else if (messageAttachments) {
    return replies.sendTextMessage(senderID, "Message with attachment received");
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


// Start server.
const server = app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port %s", server.address().port);
});
