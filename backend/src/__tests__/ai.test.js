// Mock fetch globally for Gemini API tests
global.fetch = jest.fn();

const aiService = require('../services/ai');

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  const mockTenant = {
    receptionist_name: 'Sarah',
    business_name: 'Test Clinic',
    receptionist_personality: 'Professional and friendly',
    business_description: 'A test dental clinic',
    business_hours: { mon: '9-5' },
    system_prompt: null
  };

  const mockKnowledge = [
    { title: 'Hours', content: 'Open 9 AM to 5 PM' },
    { title: 'Location', content: '123 Main St' }
  ];

  const mockHistory = [
    { direction: 'inbound', content: 'Hi' },
    { direction: 'outbound', content: 'Hello! How can I help?' }
  ];

  test('should return AI response on successful API call', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: 'We are open from 9 AM to 5 PM!' }]
          }
        }]
      })
    });

    const result = await aiService.generateResponse(mockTenant, mockKnowledge, mockHistory, 'What are your hours?');
    expect(result).toBe('We are open from 9 AM to 5 PM!');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('should return fallback message on API error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'API key invalid' } })
    });

    const result = await aiService.generateResponse(mockTenant, mockKnowledge, mockHistory, 'Hello');
    expect(result).toContain('apologize');
    expect(result).toContain('trouble');
  });

  test('should return fallback message on network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await aiService.generateResponse(mockTenant, mockKnowledge, mockHistory, 'Hello');
    expect(result).toContain('apologize');
  });

  test('should include knowledge base in the API call', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: { parts: [{ text: 'Response' }] }
        }]
      })
    });

    await aiService.generateResponse(mockTenant, mockKnowledge, mockHistory, 'Where are you?');

    const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(callBody.system_instruction.parts[0].text).toContain('Hours');
    expect(callBody.system_instruction.parts[0].text).toContain('Location');
    expect(callBody.system_instruction.parts[0].text).toContain('123 Main St');
  });

  test('should use custom system prompt when provided', async () => {
    const customTenant = { ...mockTenant, system_prompt: 'You are a custom bot.' };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: { parts: [{ text: 'Custom response' }] }
        }]
      })
    });

    await aiService.generateResponse(customTenant, mockKnowledge, mockHistory, 'Hi');

    const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(callBody.system_instruction.parts[0].text).toContain('You are a custom bot.');
  });
});
