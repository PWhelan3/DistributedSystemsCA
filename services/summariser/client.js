const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/summariser_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const summariserProto = grpc.loadPackageDefinition(packageDefinition).summariser;

const client = new summariserProto.SummariserService('localhost:50052', grpc.credentials.createInsecure());
