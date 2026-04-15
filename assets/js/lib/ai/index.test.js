import { getProviderLabel, getProviderIcon } from '.';

describe('aizz', () => {
  describe('getProviderLabel', () => {
    it('should return the provider label', () => {
      expect(getProviderLabel('googleai')).toBe('Google Gemini');
      expect(getProviderLabel('openai')).toBe('OpenAI GPT');
      expect(getProviderLabel('anthropic')).toBe('Anthropic Claude');
    });

    it('should return the provider name if no label is found', () => {
      expect(getProviderLabel('unknown')).toBe('unknown');
    });
  });

  describe('getProviderIcon', () => {
    it('should return the provider icon', () => {
      expect(getProviderIcon('googleai')).toBeDefined();
      expect(getProviderIcon('openai')).toBeDefined();
      expect(getProviderIcon('anthropic')).toBeDefined();
    });

    it('should return null if no icon is found', () => {
      expect(getProviderIcon('unknown')).toBeUndefined();
    });
  });
});
