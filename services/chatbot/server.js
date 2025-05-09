// services/chatbot/server.js

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/chatbot_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const chatbotProto = grpc.loadPackageDefinition(packageDefinition).chatbot;

const chatbotService = {
  GetAnswer: (call, callback) => {
    const question = call.request.question;
    const answer = `You asked: "${question}". This is a canned response from the AI Chatbot.`;
    callback(null, { answer });
  },

  GetSuggestions: (call) => {
    const question = call.request.question;
    const suggestions = [
      `Here’s a suggestion for "${question}" - 1`,
      `Here’s another idea for "${question}" - 2`,
      `A final tip for "${question}" - 3`
    ];
    suggestions.forEach((answer) => call.write({ answer }));
    call.end();
  }
};

function main() {
  const server = new grpc.Server();
  server.addService(chatbotProto.ChatbotService.service, chatbotService);
  const address = 'localhost:50051';
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`ChatbotService running at ${address}`);
    server.start();
  });
}

main();
