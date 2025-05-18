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
    registerService('SummariserService', 'localhost:50052');

  }

  main();