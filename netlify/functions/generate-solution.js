exports.handler = async (event, context) => {
  // Security: Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  // Validate API key exists
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY environment variable is not set');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Server configuration error. Please contact support.' 
      })
    };
  }

  try {
    // Parse and validate request body
    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { 
      messages, 
      model = 'claude-sonnet-4-20250514', 
      max_tokens = 2000 
    } = parsedBody;

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Messages array is required and cannot be empty' })
      };
    }

    // Validate max_tokens is reasonable
    if (max_tokens < 100 || max_tokens > 4096) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'max_tokens must be between 100 and 4096' })
      };
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages
      })
    });

    // Handle non-200 responses from Anthropic
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      // Return appropriate error based on status code
      if (response.status === 401) {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'API authentication failed. Please contact support.' })
        };
      } else if (response.status === 429) {
        return {
          statusCode: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          },
          body: JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.' })
        };
      } else if (response.status >= 500) {
        return {
          statusCode: 502,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'AI service temporarily unavailable. Please try again.' })
        };
      } else {
        return {
          statusCode: response.status,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: errorData.error?.message || 'Request failed. Please try again.' 
          })
        };
      }
    }

    const data = await response.json();

    // Validate response has expected structure
    if (!data.content || !Array.isArray(data.content)) {
      console.error('Unexpected API response structure:', data);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unexpected response from AI service' })
      };
    }

    // Success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store' // Don't cache AI responses
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    // Catch-all error handler
    console.error('Unexpected error in generate-solution function:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again.' 
      })
    };
  }
};
