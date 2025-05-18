const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the registry service proto
const registryPath = path.join(__dirname, '../../proto/registry_service.proto');
const registryDef = protoLoader.loadSync(registryPath);
const registryProto = grpc.loadPackageDefinition(registryDef).registry;

const registryClient = new registryProto.RegistryService(
  'localhost:5000',
  grpc.credentials.createInsecure()
);

// Function to register the service with the registry
function registerService(name, address) {
  registryClient.RegisterService({ name, address }, (err, res) => {
    if (err) {
      console.error(`Failed to register ${name}:`, err);
    } else {
      console.log(`${name} successfully registered with registry.`);
    }
  });
}

// Load summariser service proto
const PROTO_PATH = path.join(__dirname, '../../proto/summariser_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const summariserProto = grpc.loadPackageDefinition(packageDefinition).summariser;

// Basic summarisation logic
function generateSummary(text) {
  if (text.length < 30) return text;
  return text.substring(0, 30) + '... [summary]';
}

// Define the gRPC service methods
const summariserService = {
  Summarise: (call, callback) => {
    const summary = generateSummary(call.request.text);
    console.log(`Received text to summarise: "${call.request.text}"`);
    callback(null, { summary });
  },

  StreamSummaries: (call) => {
    call.on('data', (request) => {
      const summary = generateSummary(request.text);
      console.log(`Streaming request: "${request.text}" → "${summary}"`);
      call.write({ summary });
    });

    call.on('end', () => {
      console.log('Streaming ended.');
      call.end();
    });
  }
};

function main() {
  const server = new grpc.Server();
  const address = 'localhost:50052';

  server.addService(summariserProto.SummariserService.service, summariserService);

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }

    console.log(`SummariserService is now running at ${address}`);
    // No need to call server.start() in Node 22+

    // Register only after the server is confirmed to be bound
    registerService('SummariserService', address);
  });
}

main();
