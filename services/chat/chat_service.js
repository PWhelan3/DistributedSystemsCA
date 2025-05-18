function chat(call) {
    call.on('data', (msg) => {
      console.log(`Received from ${msg.sender}: ${msg.text}`);
  
      // Simulate typing delay
      setTimeout(() => {
        call.write({
          sender: 'Bot',
          text: `You said: "${msg.text}"`,
          timestamp: Date.now()
        });
      }, 1000);
    });
  
    call.on('end', () => {
      call.end();
    });
  }
  