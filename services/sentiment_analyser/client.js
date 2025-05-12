const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/sentiment_analyser_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const sentimentProto = grpc.loadPackageDefinition(packageDefinition).sentiment;

const client = new sentimentProto.SentimentAnalyserService('localhost:50053', grpc.credentials.createInsecure());
