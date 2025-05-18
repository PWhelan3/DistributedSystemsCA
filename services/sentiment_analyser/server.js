const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Loading registry proto
const registryPath = path.join(__dirname, '../../proto/registry_service.proto');
const registryDef = protoLoader.loadSync(registryPath);
const registryProto = grpc.loadPackageDefinition(registryDef).registry;

// Creating registry client
const registryClient = new registryProto.RegistryService(
  'localhost:5000',
  grpc.credentials.createInsecure()
);

// Register the service
function registerService(name, address) {
  registryClient.RegisterService({ name, address }, (err, res) => {
    if (err) {
      console.error(`Failed to register ${name}:`, err);
    } else {
      console.log(`${name} successfully registered with registry.`);
    }
  });
}

// Load the sentiment analyser proto
const PROTO_PATH = path.join(__dirname, '../../proto/sentiment_analyser_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const sentimentProto = grpc.loadPackageDefinition(packageDefinition).sentiment;

// The basic sentiment classification logic
function classifySentiment(message) {
  const lower = message.toLowerCase();
  if (lower.includes('not happy') || lower.includes('angry') || lower.includes('terrible')) return 'negative';
  if (lower.includes('great') || lower.includes('excellent') || lower.includes('happy')) return 'positive';
  return 'neutral';
}

// Define sthe entiment analyser service
const sentimentService = {
  AnalyseSentiment: (call, callback) => {
    const message = call.request.message;
    const sentiment = classifySentiment(message);
    console.log(`Analysing message: "${message}" → Sentiment: ${sentiment}`);
    callback(null, { sentiment });
  }
};

function main() {
  const server = new grpc.Server();
  const address = 'localhost:50053';

  server.addService(sentimentProto.SentimentAnalyserService.service, sentimentService);

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind SentimentAnalyserService:', err);
      return;
    }

    console.log(`SentimentAnalyserService is running at ${address}`);
    registerService('SentimentAnalyserService', address);
  });
}

main();
