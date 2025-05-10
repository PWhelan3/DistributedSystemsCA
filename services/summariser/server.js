const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/summariser_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const summariserProto = grpc.loadPackageDefinition(packageDefinition).summariser;

// Summarisation logic
function generateSummary(text) {
    if (text.length < 30) return text;
    return text.substring(0, 30) + '... [summary]';
  }

  const summariserService = {
    Summarise: (call, callback) => {
      const summary = generateSummary(call.request.text);
      callback(null, { summary });
    },

    StreamSummaries: (call) => {
      call.on('data', (request) => {
        const summary = generateSummary(request.text);
        call.write({ summary });
      });

      call.on('end', () => {
        call.end();
      });
    }
  };

  function main() {
    const server = new grpc.Server();
    server.addService(summariserProto.SummariserService.service, summariserService);
    const address = 'localhost:50052';
    server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
      console.log(`SummariserService is now running at ${address}`);
      server.start();
    });
  }

  main();