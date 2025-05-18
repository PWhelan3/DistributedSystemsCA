const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load registry proto
const registryPath = path.join(__dirname, '../../proto/registry_service.proto');
const registryDef = protoLoader.loadSync(registryPath);
const registryProto = grpc.loadPackageDefinition(registryDef).registry;

// Create registry client
const registryClient = new registryProto.RegistryService(
  'localhost:5000',
  grpc.credentials.createInsecure()
);

// Register service with registry
function registerService(name, address) {
  registryClient.RegisterService({ name, address }, (err, res) => {
    if (err) {
      console.error(`Failed to register ${name}:`, err);
    } else {
      console.log(`${name} successfully registered with registry.`);
    }
  });
}

// Load chatbot proto
const PROTO_PATH = path.join(__dirname, '../../proto/chatbot_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const chatbotProto = grpc.loadPackageDefinition(packageDefinition).chatbot;

// Define chatbot service methods
const chatbotService = {
  GetAnswer: (call, callback) => {
    const question = call.request.question;
    const answer = `You asked: "${question}". This is a response from the AI Chatbot.`;
    console.log(`Received question: "${question}"`);
    callback(null, { answer });
  },

  GetSuggestions: (call) => {
    const question = call.request.question;
    console.log(`Generating suggestions for: "${question}"`);
    const suggestions = [
      `Heres a suggestion for "${question}" - 1`,
      `Heres another idea for "${question}" - 2`,
      `A final tip for "${question}" - 3`
    ];
    suggestions.forEach((answer) => call.write({ answer }));
    call.end();
  }
};

function main() {
  const server = new grpc.Server();
  const address = 'localhost:50051';

  server.addService(chatbotProto.ChatbotService.service, chatbotService);

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind ChatbotService:', err);
      return;
    }

    console.log(`ChatbotService is running at ${address}`);
    registerService('ChatbotService', address);
  });
}

main();
