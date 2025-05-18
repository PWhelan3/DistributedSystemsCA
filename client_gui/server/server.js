const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Load the Registry proto
const registryPath = path.join(__dirname, '../proto/registry_service.proto');
const registryDef = protoLoader.loadSync(registryPath);
const registryProto = grpc.loadPackageDefinition(registryDef).registry;

const registryClient = new registryProto.RegistryService(
  'localhost:5000',
  grpc.credentials.createInsecure()
);

// API to get the list of registered services
app.get('/services', (req, res) => {
  registryClient.ListServices({}, (err, response) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch services' });
    }
    res.json(response.services);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Registry client server running at http://localhost:${PORT}`);
});
