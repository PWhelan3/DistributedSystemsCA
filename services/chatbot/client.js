const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/chatbot_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const chatbotProto = grpc.loadPackageDefinition(packageDefinition).chatbot;

const client = new chatbotProto.ChatbotService('localhost:50051', grpc.credentials.createInsecure());

// Unary RPC
client.GetAnswer({ question: 'What is your name?' }, (err, response) => {
  if (err) return console.error('Error:', err);
  console.log('Unary Response:', response.answer);
});

// Server Streaming RPC
const stream = client.GetSuggestions({ question: 'How to improve my service?' });
stream.on('data', (data) => {
  console.log('Suggestion:', data.answer);
});
stream.on('end', () => {
  console.log('All suggestions received.');
});
