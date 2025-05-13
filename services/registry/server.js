const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/registry_service.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH);
const registryProto = grpc.loadPackageDefinition(packageDef).registry;

const registeredServices = [];

const registryService = {
  RegisterService: (call, callback) => {
    const { name, address } = call.request;

    // To Prevent duplicates
    const exists = registeredServices.find(service => service.name === name);
    if (!exists) {
      registeredServices.push({ name, address });
      console.log(`Service registered: ${name} at ${address}`);
    }

    callback(null, { status: 'registered' });
  },

  ListServices: (call, callback) => {
    callback(null, { services: registeredServices });
  }
};

function main() {
  const server = new grpc.Server();
  server.addService(registryProto.RegistryService.service, registryService);
  const address = 'localhost:5000';
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`RegistryService is running at ${address}`);
    server.start();
  });
}

main();
