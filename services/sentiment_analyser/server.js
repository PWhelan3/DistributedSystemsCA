const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

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
}

main();
