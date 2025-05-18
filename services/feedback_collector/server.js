//Basic boilerplate
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the proto file
const feedbackPath = path.join(__dirname, '../../proto/feedback_collector_service.proto');
const feedbackDef = protoLoader.loadSync(feedbackPath);
const feedbackProto = grpc.loadPackageDefinition(feedbackDef).feedback;

// Defining the service logic
const feedbackService = {
  CollectFeedback: (call, callback) => {
    let count = 0;
    call.on('data', (feedback) => {
      console.log('Received feedback:', feedback.message);
      count++;
    });

    call.on('end', () => {
      callback(null, {
        total_messages: count,
        thank_you_note: `Thanks for submitting ${count} feedback messages!`,
      });
    });
  }
};

function main() {
  const server = new grpc.Server();
  const address = 'localhost:50054';

  server.addService(feedbackProto.FeedbackCollectorService.service, feedbackService);

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) return console.error('Server bind failed:', err);
    console.log(`FeedbackCollectorService running at ${address}`);

    // Register the service with the registry
    const registryPath = path.join(__dirname, '../../proto/registry_service.proto');
    const registryDef = protoLoader.loadSync(registryPath);
    const registryProto = grpc.loadPackageDefinition(registryDef).registry;

    const registryClient = new registryProto.RegistryService('localhost:5000', grpc.credentials.createInsecure());
    registryClient.RegisterService({ name: 'FeedbackCollectorService', address }, (err) => {
      if (err) console.error('Failed to register:', err);
      else console.log('FeedbackCollectorService registered successfully');
    });
  });
}

main();
