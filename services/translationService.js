const { getGeminiModel } = require('../config/gemini');
const { LANGUAGES } = require('../utils/constants');

const translateText = async (text, sourceLanguage, targetLanguage) => {
  try {
    const model = getGeminiModel();
    
    const sourceLangName = LANGUAGES.find(l => l.code === sourceLanguage)?.name || sourceLanguage;
    const targetLangName = LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage;
    
    const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}.
    
Text: "${text}"

Return only the translated text without any additional commentary or explanation.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    
    return {
      originalText: text,
      translatedText: response.text().trim(),
      sourceLanguage,
      targetLanguage
    };
  } catch (error) {
    console.error('Gemini translation error:', error);
    throw new Error(`Translation failed: ${error.message}`);
  }
};

module.exports = { translateText };