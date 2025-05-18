import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [services, setServices] = useState([]);
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get('http://localhost:3001/services')
      .then((res) => setServices(res.data))
      .catch((err) => console.error('Failed to load services:', err));
  }, []);

  const handleInputChange = (service, value) => {
    setInputs({ ...inputs, [service]: value });
  };

  const handleSubmit = (serviceName) => {
    const endpointMap = {
      ChatbotService: '/chatbot',
      SummariserService: '/summarise',
      SentimentAnalyserService: '/sentiment'
    };

    if (!endpointMap[serviceName]) return;

    setLoading({ ...loading, [serviceName]: true });
    setErrors({ ...errors, [serviceName]: null });

    axios.post(`http://localhost:3001${endpointMap[serviceName]}`, { input: inputs[serviceName] || '' })
      .then((res) => {
        setResults({ ...results, [serviceName]: res.data });
      })
      .catch((err) => {
        setErrors({ ...errors, [serviceName]: 'Failed to fetch response.' });
      })
      .finally(() => {
        setLoading({ ...loading, [serviceName]: false });
      });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Registered Microservices</h1>
      {services.map((service, index) => (
        <div key={index} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
          <h2>{service.name}</h2>
          <input
            type="text"
            placeholder="Enter input"
            value={inputs[service.name] || ''}
            onChange={(e) => handleInputChange(service.name, e.target.value)}
            disabled={loading[service.name]}
          />
          <button onClick={() => handleSubmit(service.name)} disabled={loading[service.name]}>
            {loading[service.name] ? 'Processing...' : 'Submit'}
          </button>
          {results[service.name] && (
            <pre style={{ background: '#f4f4f4', padding: '1rem' }}>
              {JSON.stringify(results[service.name], null, 2)}
            </pre>
          )}
          {errors[service.name] && (
            <p style={{ color: 'red' }}>{errors[service.name]}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
