import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State to hold the list of available services fetched from backend
  const [services, setServices] = useState([]);

  //track user input for each service
  const [inputs, setInputs] = useState({});

  // store results returned from each service
  const [results, setResults] = useState({});

  //handle loading status for each service call
  const [loading, setLoading] = useState({});

  //store any errors that occur during service calls
  const [errors, setErrors] = useState({});

  // Fetch list of services from backend
  useEffect(() => {
    axios.get('http://localhost:3001/services')
      .then((res) => setServices(res.data))
      .catch((err) => {
        console.error(err);
        // Handle error in fetching services
        setErrors({ ...errors, fetch: 'Failed to fetch services list.' });
      });
  }, []);

  // Handle user input changes
  const handleInputChange = (service, value) => {
    setInputs({ ...inputs, [service]: value });
  };

  // Handle the form submission.... sending request to the right service
  const handleSubmit = async (serviceName) => {
    // Mapping service names to the API endpoints
    const endpointMap = {
      ChatbotService: '/chatbot',
      SummariserService: '/summarise',
      SentimentAnalyserService: '/sentiment',
      FeedbackCollectorService: '/feedback'
    };

    // Special handling for streaming chat service
    if (serviceName === 'ChatStreamService') {
      setLoading(prev => ({ ...prev, [serviceName]: true }));
    
      await axios.post('http://localhost:3001/chatstream', {
        sender: "User",
        text: inputs[serviceName],
      })
      .then((res) => {
        // store the chat response
        setResults(prev => ({ ...prev, [serviceName]: res.data }));
        // Clear input after sending it
        setInputs(prev => ({ ...prev, [serviceName]: '' }));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, [serviceName]: false }));
      });

      return; // Exit after handling streaming
    }

    // Find the matching endpoint for the nonv streaming services
    const endpoint = endpointMap[serviceName];
    if (!endpoint) return;

    // Mark loading state
    setLoading((prev) => ({ ...prev, [serviceName]: true }));
    setErrors((prev) => ({ ...prev, [serviceName]: null }));

    // Prepare request payload depending on service
    const data =
      serviceName === 'FeedbackCollectorService'
        ? { messages: (inputs[serviceName] || '').split('\n').filter(Boolean) }
        : { input: inputs[serviceName] || '' };

    try {
      // Send POST request to the service endpoint
      const response = await axios.post(
        `http://localhost:3001${endpoint}`,
        data,
        {
          headers: {
            'x-api-key': 'securekey', // Auth key for the backend
          },
        }
      );

      // Save the successful response
      setResults((prev) => ({ ...prev, [serviceName]: response.data }));
      setErrors((prev) => ({ ...prev, [serviceName]: null }));
    } catch (err) {
      // capture and store error message
      const msg = err.response?.data?.error || 'Oops! Something went wrong. Please try again.';
      setErrors((prev) => ({ ...prev, [serviceName]: msg }));
    } finally {
      // Try and Always end the loading state
      setLoading((prev) => ({ ...prev, [serviceName]: false }));
    }
  };

  return (
    <div className="container">
      <h1>Distributed Systems CA</h1>
      <h3>Customer Support Microservices<br />Peter Whelan</h3>

      <div className="card-grid">
        {/* render a card for each service except Feedback */}
        {services
          .filter(service => service.name !== 'FeedbackCollectorService')
          .map((service) => (
            <div key={service.name} className="card">
              <h2>{service.name.replace('Service', '')}</h2>

              {/* Use textarea just  for summariser, input box for others */}
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

              {/* Button to trigger the service request */}
              <button
                onClick={() => handleSubmit(service.name)}
                disabled={loading[service.name]}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading[service.name] ? 'Processing...' : 'Send'}
              </button>

              {/* Display service result */}
              {results[service.name] && (
                <pre className="response">
                  {JSON.stringify(results[service.name], null, 2)}
                </pre>
              )}

              {/* Display any error  */}
              {errors[service.name] && (
                <p className="error">{errors[service.name]}</p>
              )}
            </div>
        ))}

        {/* Feedback Collector Card */}
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

            {/* Display feedback results */}
            {results['FeedbackCollectorService'] && (
              <pre className="response">
                {JSON.stringify(results['FeedbackCollectorService'], null, 2)}
              </pre>
            )}

            {/* Display error if any */}
            {errors['FeedbackCollectorService'] && (
              <p className="error">{errors['FeedbackCollectorService']}</p>
            )}
          </div>
        )}

        {/* Live Chat Card for streaming interaction */}
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
