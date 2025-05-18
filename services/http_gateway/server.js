const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

/** 🔐 API KEY SECURITY **/
const API_KEY = 'securekey';
app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  next();
});


// ---- Load all Protos and Clients ----

function loadProto(file, pkgName) {
  const def = protoLoader.loadSync(path.join(__dirname, file));
  return grpc.loadPackageDefinition(def)[pkgName];
}

const registryProto = loadProto('../../proto/registry_service.proto', 'registry');
const chatbotProto = loadProto('../../proto/chatbot_service.proto', 'chatbot');
const summariserProto = loadProto('../../proto/summariser_service.proto', 'summariser');
const sentimentProto = loadProto('../../proto/sentiment_analyser_service.proto', 'sentiment');
const feedbackProto = loadProto('../../proto/feedback_collector_service.proto', 'feedback');
const chatProto = loadProto('./protos/chat.proto', 'chat');

const registryClient = new registryProto.RegistryService('localhost:5000', grpc.credentials.createInsecure());


// ---- Routes ----

// 1️⃣ List Services
app.get('/services', (req, res) => {
  registryClient.ListServices({}, (err, response) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch services' });
    res.json(response.services);
  });
});

// 2️⃣ Feedback
app.post('/feedback', (req, res) => {
  const { messages } = req.body;
  const client = new feedbackProto.FeedbackCollectorService('localhost:50054', grpc.credentials.createInsecure());

  const call = client.CollectFeedback((err, response) => {
    if (err) return res.status(500).json({ error: 'Feedback collection failed' });
    res.json(response);
  });

  messages.forEach((msg) => call.write({ message: msg }));
  call.end();
});

// 3️⃣ Chatbot
app.post('/chatbot', (req, res) => {
  const { input } = req.body;
  const client = new chatbotProto.ChatbotService('localhost:50051', grpc.credentials.createInsecure());

  client.GetAnswer({ question: input }, (err, response) => {
    if (err) return res.status(500).json({ error: 'Chatbot failed' });
    res.json(response);
  });
});

// 4️⃣ Summariser
app.post('/summarise', (req, res) => {
  const { input } = req.body;
  const client = new summariserProto.SummariserService('localhost:50052', grpc.credentials.createInsecure());

  client.Summarise({ text: input }, (err, response) => {
    if (err) return res.status(500).json({ error: 'Summariser failed' });
    res.json(response);
  });
});

// 5️⃣ Sentiment
app.post('/sentiment', (req, res) => {
  const { input } = req.body;
  const client = new sentimentProto.SentimentAnalyserService('localhost:50053', grpc.credentials.createInsecure());

  client.AnalyseSentiment({ message: input }, (err, response) => {
    if (err) return res.status(500).json({ error: 'Sentiment failed' });
    res.json(response);
  });
});

// 6️⃣ Chat Stream (Client Streaming + Response via latestMessage)
let chatStream;
let latestMessage = null;

app.post('/chatstream', (req, res) => {
  const { sender, text } = req.body;

  if (!chatStream) {
    const client = new chatProto.ChatStreamService('localhost:50055', grpc.credentials.createInsecure());
    chatStream = client.Chat();

    chatStream.on('data', (msg) => {
      latestMessage = msg;
    });

    chatStream.on('end', () => {
      console.log("Chat ended");
    });
  }

  chatStream.write({ sender, text, timestamp: Date.now() });

  setTimeout(() => {
    res.json(latestMessage || { sender: 'Bot', text: '...' });
  }, 1000);
});


// ---- Launch Express Server ----
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`HTTP Gateway listening at http://localhost:${PORT}`);
});
