const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * OpenRouter AI Service - Matches Spring Boot OpenRouterAIService
 */
const openRouterService = {
  /**
   * Get AI suggestions for blog post improvement
   * Matches OpenRouterAIService.getAISuggestions(String title, String content)
   */
  async getAISuggestions(title, content) {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      const model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

      const prompt = `You are an expert blog editor. Analyze the following blog post and provide helpful suggestions for improvement.

### Blog Title: ${title}

### Blog Content:
${content}

### Task:
1. Check for grammatical errors or typos.
2. Identify areas where the flow can be improved.
3. Suggest more engaging language or alternative phrasing for key sections.
4. Provide a numbered list of 3-5 specific, actionable suggestions.

### Output Format:
Provide ONLY the suggestions in a clear, bulleted or numbered list. Do not rewrite the whole post.`;

      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model,
          messages: [
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'SmartBlog'
          }
        }
      );

      const responseBody = response.data;

      if (responseBody && responseBody.choices && responseBody.choices.length > 0) {
        return responseBody.choices[0].message.content;
      }

      return 'AI did not return any suggestions.';
    } catch (error) {
      console.error('Error calling OpenRouter API:', error.message);
      return 'Apologies, AI Suggestion Service is Unavailable at the moment. Please ensure your API key is correctly configured.';
    }
  }
};

module.exports = openRouterService;
