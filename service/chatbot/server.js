const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the .proto file
const PROTO_PATH = path.join(__dirname, '../../proto/chatbot_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const chatbotProto = grpc.loadPackageDefinition(packageDefinition).chatbot;


// Test GetAnswer
client.GetAnswer({ question: 'What is your name?' }, (err, response) => {
  if (err) return console.error('Error:', err);
  console.log('Unary Response:', response.answer);
});

// Test GetSuggestions
const stream = client.GetSuggestions({ question: 'How to improve my service?' });
stream.on('data', (data) => {
  console.log('Suggestion:', data.answer);
});
stream.on('end', () => {
  console.log('All suggestions received.');
});