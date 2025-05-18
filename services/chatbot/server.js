

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// For registering service
const registryPath = path.join(__dirname, '../../proto/registry_service.proto');
const registryDef = protoLoader.loadSync(registryPath);
const registryProto = grpc.loadPackageDefinition(registryDef).registry;

const registryClient = new registryProto.RegistryService(
  'localhost:5000', grpc.credentials.createInsecure()
);

// Function to Register service
function registerService(name, address) {
  registryClient.RegisterService({ name, address }, (err, res) => {
    if (err) {
      console.error(`Failed to register ${name}:`, err);
    } else {
      console.log(`${name} registered with registry.`);
    }
  });
}


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
  registerService('ChatbotService', 'localhost:50051');

}

main();
