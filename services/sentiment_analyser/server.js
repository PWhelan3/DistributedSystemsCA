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


const PROTO_PATH = path.join(__dirname, '../../proto/sentiment_analyser_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const sentimentProto = grpc.loadPackageDefinition(packageDefinition).sentiment;

// Sentiment classifier
function classifySentiment(message) {
  const lower = message.toLowerCase();
  if (lower.includes('not happy') || lower.includes('angry') || lower.includes('terrible')) return 'negative';
  if (lower.includes('great') || lower.includes('excellent') || lower.includes('happy')) return 'positive';
  return 'neutral';
}

const sentimentService = {
  AnalyseSentiment: (call, callback) => {
    const sentiment = classifySentiment(call.request.message);
    callback(null, { sentiment });
  }
};

function main() {
  const server = new grpc.Server();
  server.addService(sentimentProto.SentimentAnalyserService.service, sentimentService);
  const address = 'localhost:50053';
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`SentimentAnalyserService is running at ${address}`);
    server.start();
  });
  registerService('SentimentAnalyserService', 'localhost:50053');

}

main();
