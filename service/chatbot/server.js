const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the .proto file
const PROTO_PATH = path.join(__dirname, '../../proto/chatbot_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const chatbotProto = grpc.loadPackageDefinition(packageDefinition).chatbot;
