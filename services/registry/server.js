const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the proto files
const PROTO_PATH = path.join(__dirname, '../../proto/registry_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const registryProto = grpc.loadPackageDefinition(packageDefinition).registry;

// service registry
const services = {};

function registerService(call, callback) {
  const { name, address } = call.request;
  services[name] = address;
  console.log(`Service registered: ${name} at ${address}`);
  callback(null, {});
}

function listServices(call, callback) {
  const serviceList = Object.entries(services).map(([name, address]) => ({ name, address }));
  callback(null, { services: serviceList });
}

function main() {
  const server = new grpc.Server();
  server.addService(registryProto.RegistryService.service, {
    RegisterService: registerService,
    ListServices: listServices
  });

  const address = 'localhost:5000';

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Server bind failed:', err);
      return;
    }
    console.log(`RegistryService is running at ${address}`);
  });
}

main();
