document.getElementById('application-form').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const company = document.getElementById('company').value;
    const title = document.getElementById('title').value;
    const status = document.getElementById('status').value;
    const resume = document.getElementById('resume').files[0];
    const notes = document.getElementById('notes').value;
  
    // Open OAuth2 consent URL in a new tab
    chrome.identity.launchWebAuthFlow({
      url: 'https://your-backend-url.com/auth',
      interactive: true
    }, async (redirectUrl) => {
      const url = new URL(redirectUrl);
      const access_token = url.searchParams.get('access_token');
      const refresh_token = url.searchParams.get('refresh_token');
  
      try {
        const response = await fetch('https://your-backend-url.com/addApplication', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ company, status, title, resume, notes, access_token })
        });
  
        if (!response.ok) {
          throw new Error('Error adding application: ' + response.statusText);
        }
  
        console.log('Application added successfully');
      } catch (error) {
        console.error(error.message);
      }
    });
  });
  