// Artillery Load Test Processors
// Custom functions for load testing scenarios

module.exports = {
  // Generate realistic job IDs
  generateJobId: function(context, ee, next) {
    context.vars.jobId = 'job_' + Math.random().toString(36).substring(7);
    return next();
  },

  // Generate realistic contract IDs
  generateContractId: function(context, ee, next) {
    context.vars.contractId = 'contract_' + Math.random().toString(36).substring(7);
    return next();
  },

  // Generate realistic user IDs
  generateUserId: function(context, ee, next) {
    context.vars.userId = 'user_' + Math.random().toString(36).substring(7);
    return next();
  },

  // Log performance metrics
  logMetrics: function(requestParams, response, context, ee, next) {
    const responseTime = response.statusCode ? 'success' : 'failed';
    const statusCode = response.statusCode || 'unknown';

    console.log(`[${new Date().toISOString()}] ${requestParams.name} - Status: ${statusCode}, ResponseTime: ${response.headers['x-response-time'] || 'N/A'}`);

    return next();
  },

  // Generate random amount between 1000 and 100000 cents
  generateAmount: function(context, ee, next) {
    context.vars.amount = Math.floor(Math.random() * (100000 - 1000) + 1000);
    return next();
  },

  // Generate realistic timeline strings
  generateTimeline: function(context, ee, next) {
    const timelines = ['3 days', '5 days', '1 week', '2 weeks', '10 days'];
    context.vars.timeline = timelines[Math.floor(Math.random() * timelines.length)];
    return next();
  },

  // Generate random photo URLs (simulated)
  generatePhotos: function(context, ee, next) {
    const count = Math.floor(Math.random() * (5 - 1) + 1); // 1-5 photos
    const photos = [];
    for (let i = 0; i < count; i++) {
      photos.push(`https://example.com/photos/photo_${Math.random().toString(36).substring(7)}.jpg`);
    }
    context.vars.photos = JSON.stringify(photos);
    return next();
  },

  // Capture and store important IDs from responses
  captureIds: function(requestParams, response, context, ee, next) {
    try {
      const body = JSON.parse(response.body);

      if (body.data) {
        if (body.data.id) context.vars.lastId = body.data.id;
        if (body.data.tokens && body.data.tokens.accessToken) {
          context.vars.currentToken = body.data.tokens.accessToken;
        }
        if (body.data.contract && body.data.contract.id) {
          context.vars.contractId = body.data.contract.id;
        }
        if (body.data.bidId) {
          context.vars.bidId = body.data.bidId;
        }
      }
    } catch (e) {
      // Response is not JSON, skip
    }

    return next();
  },

  // Handle authentication errors
  handleAuthError: function(requestParams, response, context, ee, next) {
    if (response.statusCode === 401) {
      console.error(`Authentication failed: ${requestParams.url}`);
      // Regenerate auth token or retry
    }
    return next();
  },

  // Handle payment errors
  handlePaymentError: function(requestParams, response, context, ee, next) {
    if (response.statusCode >= 400 && requestParams.url.includes('/payments')) {
      console.error(`Payment error: ${response.statusCode} - ${requestParams.url}`);
    }
    return next();
  },

  // Simulate think time (user delay between actions)
  thinkTime: function(context, ee, next) {
    const delay = Math.floor(Math.random() * 5000); // 0-5 seconds
    setTimeout(() => {
      next();
    }, delay);
  },
};
