import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [services, setServices] = useState([]);
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get('http://localhost:3001/services')
      .then((res) => setServices(res.data))
      .catch((err) => {
        console.error(err); // 👈 Add this
        setErrors({ ...errors, [serviceName]: 'Failed to fetch response.' });
      })
  }, []);

  const handleInputChange = (service, value) => {
    setInputs({ ...inputs, [service]: value });
  };

  const handleSubmit = async (serviceName) => {
    const endpointMap = {
      ChatbotService: '/chatbot',
      SummariserService: '/summarise',
      SentimentAnalyserService: '/sentiment',
      FeedbackCollectorService: '/feedback'
    };

    if (serviceName === 'ChatStreamService') {
      setLoading(prev => ({ ...prev, [serviceName]: true }));
    
      await axios.post('http://localhost:3001/chatstream', {
        sender: "User",
        text: inputs[serviceName],
      })
      .then((res) => {
        setResults(prev => ({ ...prev, [serviceName]: res.data }));
        setInputs(prev => ({ ...prev, [serviceName]: '' }));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, [serviceName]: false }));
      });
    
      return;
    }
    

    const endpoint = endpointMap[serviceName];
    if (!endpoint) return;

    setLoading((prev) => ({ ...prev, [serviceName]: true }));
    setErrors((prev) => ({ ...prev, [serviceName]: null }));

    const data =
      serviceName === 'FeedbackCollectorService'
        ? { messages: (inputs[serviceName] || '').split('\n').filter(Boolean) }
        : { input: inputs[serviceName] || '' };

    try {
      const response = await axios.post(
        `http://localhost:3001${endpoint}`,
        data,
        {
          headers: {
            'x-api-key': 'securekey',
          },
        }
      );

      setResults((prev) => ({ ...prev, [serviceName]: response.data }));
      setErrors((prev) => ({ ...prev, [serviceName]: null }));
    } catch (err) {
      const msg = err.response?.data?.error || 'Oops! Something went wrong. Please try again.';
      setErrors((prev) => ({ ...prev, [serviceName]: msg }));
    } finally {
      setLoading((prev) => ({ ...prev, [serviceName]: false }));
    }
  };


  return (
    <div className="container">
      <h1>Distributed Systems CA</h1>
      <h3>Customer Support Microservices<br />Peter Whelan</h3>

      <div className="card-grid">
        {services
          .filter(service => service.name !== 'FeedbackCollectorService')
          .map((service) => (
            <div key={service.name} className="card">
              <h2>{service.name.replace('Service', '')}</h2>

              {service.name === 'SummariserService' ? (
                <textarea
                  rows="5"
                  placeholder="Enter text to summarise..."
                  value={inputs[service.name] || ''}
                  onChange={(e) => handleInputChange(service.name, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Enter input for ${service.name.replace('Service', '')}`}
                  value={inputs[service.name] || ''}
                  onChange={(e) => handleInputChange(service.name, e.target.value)}
                />
              )}

              <button
                onClick={() => handleSubmit(service.name)}
                disabled={loading[service.name]}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading[service.name] ? 'Processing...' : 'Send'}
              </button>

              {results[service.name] && (
                <pre className="response">
                  {JSON.stringify(results[service.name], null, 2)}
                </pre>
              )}
              {errors[service.name] && (
                <p className="error">{errors[service.name]}</p>
              )}
            </div>
        ))}

        {services.find(service => service.name === 'FeedbackCollectorService') && (
          <div className="card feedback-card">
            <h2>Feedback</h2>
            <textarea
              rows={5}
              placeholder="Enter feedback (one message per line)"
              value={inputs['FeedbackCollectorService'] || ''}
              onChange={(e) => handleInputChange('FeedbackCollectorService', e.target.value)}
              disabled={loading['FeedbackCollectorService']}
              className="w-full p-2 rounded border"
            />

            <button
              onClick={() => handleSubmit('FeedbackCollectorService')}
              disabled={loading['FeedbackCollectorService']}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading['FeedbackCollectorService'] ? 'Collecting...' : 'Send Feedback'}
            </button>

            {results['FeedbackCollectorService'] && (
              <pre className="response">
                {JSON.stringify(results['FeedbackCollectorService'], null, 2)}
              </pre>
            )}
            {errors['FeedbackCollectorService'] && (
              <p className="error">{errors['FeedbackCollectorService']}</p>
            )}
          </div>
        )}

        {services.some(s => s.name === 'ChatStreamService') && (
          <div className="card">
            <h2>Live Chat</h2>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputs['ChatStreamService'] || ''}
              onChange={(e) => handleInputChange('ChatStreamService', e.target.value)}
             className="w-full p-2 rounded border"
            />
            <button
              onClick={() => handleSubmit('ChatStreamService')}
              disabled={loading['ChatStreamService']}
            >
              {loading['ChatStreamService'] ? 'Sending...' : 'Send'}
            </button>
           {results['ChatStreamService'] && (
              <div className="response mt-2">{results['ChatStreamService'].text}</div>
            )}
          </div>
        )}



      </div>
    </div>
  );

}

export default App;
