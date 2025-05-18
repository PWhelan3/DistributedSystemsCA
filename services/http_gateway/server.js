const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON body parsing

// Load Registry proto
const registryPath = path.join(__dirname, '../../proto/registry_service.proto');
const registryDef = protoLoader.loadSync(registryPath);
const registryProto = grpc.loadPackageDefinition(registryDef).registry;

const registryClient = new registryProto.RegistryService(
  'localhost:5000',
  grpc.credentials.createInsecure()
);

// Load Chatbot proto
const chatbotPath = path.join(__dirname, '../../proto/chatbot_service.proto');
const chatbotDef = protoLoader.loadSync(chatbotPath);
const chatbotProto = grpc.loadPackageDefinition(chatbotDef).chatbot;


// Load Summariser proto
const summariserPath = path.join(__dirname, '../../proto/summariser_service.proto');
const summariserDef = protoLoader.loadSync(summariserPath);
const summariserProto = grpc.loadPackageDefinition(summariserDef).summariser;

// Load Sentiment Analyser proto
const sentimentPath = path.join(__dirname, '../../proto/sentiment_analyser_service.proto');
const sentimentDef = protoLoader.loadSync(sentimentPath);
const sentimentProto = grpc.loadPackageDefinition(sentimentDef).sentiment;

// --- Routes ---

// Fetch registered services
app.get('/services', (req, res) => {
  registryClient.ListServices({}, (err, response) => {
    if (err) {
      console.error('gRPC error:', err);
      return res.status(500).json({ error: 'Failed to fetch services' });
    }
    res.json(response.services);
  });
});

app.get('/ping', (req, res) => {
    console.log('Ping received');
    res.json({ message: 'pong' });
  });


// Chatbot route
app.post('/chatbot', (req, res) => {
  const { input } = req.body;

  console.log('[Gateway] /chatbot input:', input);

  const client = new chatbotProto.ChatbotService('localhost:50051', grpc.credentials.createInsecure());

  client.GetAnswer({ question: input }, (err, response) => {
    if (err) {
      console.error('Chatbot error:', err);
      return res.status(500).json({ error: 'Failed to get chatbot response' });
    }
    res.json(response);
  });
});

// Summariser route
app.post('/summarise', (req, res) => {
  const { input } = req.body;
  const client = new summariserProto.SummariserService('localhost:50052', grpc.credentials.createInsecure());

  client.Summarise({ text: input }, (err, response) => {
    if (err) {
      console.error('Summariser error:', err);
      return res.status(500).json({ error: 'Failed to get summary' });
    }
    res.json(response);
  });
});

// Sentiment analyser route
app.post('/sentiment', (req, res) => {
  const { input } = req.body;
  const client = new sentimentProto.SentimentAnalyserService('localhost:50053', grpc.credentials.createInsecure());

  client.AnalyseSentiment({ message: input }, (err, response) => {
    if (err) {
      console.error('Sentiment error:', err);
      return res.status(500).json({ error: 'Failed to analyse sentiment' });
    }
    res.json(response);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`HTTP Gateway listening at http://localhost:${PORT}`);
});
