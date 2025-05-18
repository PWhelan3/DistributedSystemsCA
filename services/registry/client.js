//To test the service resistries

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/registry_service.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH);
const registryProto = grpc.loadPackageDefinition(packageDef).registry;

const client = new registryProto.RegistryService('localhost:5000', grpc.credentials.createInsecure());

client.ListServices({}, (err, response) => {
  if (err) return console.error(err);
  console.log('Discovered services:');
  response.services.forEach(service => {
    console.log(`- ${service.name} at ${service.address}`);
  });
});
