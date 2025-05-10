const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/summariser_service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const summariserProto = grpc.loadPackageDefinition(packageDefinition).summariser;

const client = new summariserProto.SummariserService('localhost:50052', grpc.credentials.createInsecure());

// Unary RPC
client.Summarise({ text: "This is a lengthy customer enquiry regarding delayed delivery of their order." }, (err, response) => {
    if (err) return console.error('Unary Error:', err);
    console.log('Unary Summary:', response.summary);
  });

  // Bidirectional streaming RPC
  const stream = client.StreamSummaries();

  stream.write({ text: "Enquiry 1: Unable to access my invoice." });
  stream.write({ text: "Enquiry 2: Refund policy clarification required." });
  stream.write({ text: "Enquiry 3: The website is not loading properly." });

  stream.end();

  stream.on('data', (response) => {
    console.log('Streamed Summary:', response.summary);
  });

  stream.on('end', () => {
    console.log('All summaries received.');
  });