const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const Redis = require('ioredis');

dotenv.config();

// Initialize Redis client if REDIS_URL is provided
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
app.use(limiter);

// Input validation schemas
const contentSchema = z.object({
  postType: z.enum(['post', 'thread', 'poll']),
  topic: z.string().min(1, 'Topic is required'),
  audience: z.string().optional().default('general audience'),
  style: z.string().optional().default('neutral and engaging'),
  guidelines: z.string().optional().default('none'),
  preferences: z.object({
    platforms: z.record(z.boolean()).optional(),
    tonePreference: z.string().optional(),
    contentLength: z.string().optional(),
    hashtagPreference: z.string().optional()
  }).optional()
});

// Prompt templates
const promptTemplates = {
  post: ({ topic, audience, style, guidelines, preferences }) => `
    Generate a social media post.
    Topic: ${topic}
    Target Audience: ${audience}
    Style: ${style}
    Guidelines: ${guidelines}
    ${preferences ? `Platform Preferences: ${JSON.stringify(preferences.platforms)}
    Tone Preference: ${preferences.tonePreference}
    Content Length: ${preferences.contentLength}
    Hashtag Preference: ${preferences.hashtagPreference}` : ''}
  `,
  thread: ({ topic, audience, style, guidelines, preferences }) => `
    Generate a multi-post thread for a Twitter-like platform.
    Topic: ${topic}
    Target Audience: ${audience}
    Style: ${style}
    Guidelines: ${guidelines}
    ${preferences ? `Tone Preference: ${preferences.tonePreference}
    Content Length: ${preferences.contentLength}
    Hashtag Preference: ${preferences.hashtagPreference}` : ''}
  `,
  poll: ({ topic, audience, style, guidelines }) => `
    Generate an engaging social media poll.
    Topic: ${topic}
    Target Audience: ${audience}
    Style: ${style}
    Guidelines: ${guidelines}

    Please format the response EXACTLY like this:
    1. Poll Question
    2. Option A
    3. Option B
    4. Option C
    5. Option D
    6. Explanation of why this poll is engaging
  `
};

// Generic prompt generator
function generatePrompt(type, content) {
  const template = promptTemplates[type];
  if (!template) {
    throw new Error(`Invalid content type: ${type}`);
  }
  return template(content);
}

// Cache middleware
async function checkCache(req, res, next) {
  if (!redis) return next();
  
  const cacheKey = `content:${JSON.stringify(req.body)}`;
  try {
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      console.log('Cache hit for:', cacheKey);
      return res.json(JSON.parse(cachedResult));
    }
    console.log('Cache miss for:', cacheKey);
  } catch (error) {
    console.error('Cache error:', error);
  }
  next();
}

// Error handler middleware
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      details: err.errors
    });
  }

  const statusCode = err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

// Generate post endpoint
app.post('/api/generatePost', checkCache, async (req, res, next) => {
  try {
    // Validate input
    const validatedInput = contentSchema.parse(req.body);
    
    // OpenAI configuration check
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = generatePrompt(validatedInput.postType, validatedInput);
    console.log('Generated prompt:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: 'system',
          content: `You are an AI-powered social media content generation assistant for Intellisync Solutions, specializing in creating engaging, platform-optimized content across multiple social media channels.

Core Objectives:
- Generate high-quality, contextually relevant social media content
- Adapt tone and style based on user-specified preferences
- Ensure content is platform-specific and meets each platform's best practices`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500')
    });

    const result = {
      success: true,
      content: completion.choices[0].message.content,
      usage: completion.usage
    };

    // Cache the result
    if (redis) {
      const cacheKey = `content:${JSON.stringify(req.body)}`;
      await redis.setex(cacheKey, 3600, JSON.stringify(result)); // Cache for 1 hour
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Generate image endpoint
app.post('/api/generateImage', checkCache, async (req, res, next) => {
  try {
    const { prompt } = req.body;
    console.log('Received image generation request:', { prompt });

    // Input validation
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Validate OpenAI configuration
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('Sending request to OpenAI...');
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url"
    });
    console.log('Received response from OpenAI');

    if (!response.data || !response.data[0] || !response.data[0].url) {
      console.error('Invalid response from OpenAI:', response);
      throw new Error('Invalid response from image generation service');
    }

    const result = {
      success: true,
      imageUrl: response.data[0].url
    };

    // Cache the result
    if (redis) {
      const cacheKey = `image:${prompt}`;
      await redis.setex(cacheKey, 3600, JSON.stringify(result)); // Cache for 1 hour
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Generate poll endpoint
app.post('/api/generate-poll', checkCache, async (req, res, next) => {
  try {
    const { topic, audience, style, guidelines } = req.body;
    console.log('Received poll generation request:', { topic, audience, style, guidelines });

    // Input validation
    if (!topic) {
      throw new Error('Poll topic is required');
    }

    // Validate OpenAI configuration
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
      Generate an engaging social media poll.
      Topic: ${topic}
      Target Audience: ${audience}
      Style: ${style}
      Guidelines: ${guidelines}

      Please format the response EXACTLY like this:
      1. Poll Question
      2. Option A
      3. Option B
      4. Option C
      5. Option D
      6. Explanation of why this poll is engaging
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: 'system',
          content: `You are an AI-powered poll generation assistant for social media. Create engaging, interactive polls that encourage audience participation and generate meaningful discussions. Focus on clarity, relevance, and engagement potential.`
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = completion.choices[0].message.content.trim();
    const lines = content.split('\n').filter(line => line.trim());
    
    const result = {
      success: true,
      content: content,
      question: lines[0].replace(/^[0-9]+\.\s*/, '').trim(),
      options: lines.slice(1, 4).map(line => line.replace(/^[0-9]+\.\s*/, '').trim())
    };

    // Cache the result
    if (redis) {
      const cacheKey = `poll:${JSON.stringify(req.body)}`;
      await redis.setex(cacheKey, 3600, JSON.stringify(result)); // Cache for 1 hour
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Apply error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
