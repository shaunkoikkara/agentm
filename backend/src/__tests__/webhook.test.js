const whatsappService = require('../services/whatsapp');

describe('WhatsApp Service', () => {
  describe('verifyWebhook', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv, WHATSAPP_VERIFY_TOKEN: 'test_token_123' };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('should return challenge when mode and token are valid', () => {
      const result = whatsappService.verifyWebhook('subscribe', 'test_token_123', 'challenge_abc');
      expect(result).toBe('challenge_abc');
    });

    test('should return null when mode is invalid', () => {
      const result = whatsappService.verifyWebhook('invalid_mode', 'test_token_123', 'challenge_abc');
      expect(result).toBeNull();
    });

    test('should return null when token does not match', () => {
      const result = whatsappService.verifyWebhook('subscribe', 'wrong_token', 'challenge_abc');
      expect(result).toBeNull();
    });

    test('should return null when token is undefined', () => {
      const result = whatsappService.verifyWebhook('subscribe', undefined, 'challenge_abc');
      expect(result).toBeNull();
    });
  });
});
