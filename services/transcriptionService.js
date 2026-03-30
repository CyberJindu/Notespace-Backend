const { getGeminiModel } = require('../config/gemini');
const { LANGUAGES } = require('../utils/constants');

const transcribeAudio = async (audioBuffer, mimeType, targetLanguage) => {
  try {
    const model = getGeminiModel();
    
    // Convert buffer to base64
    const base64Audio = audioBuffer.toString('base64');
    
    // Get target language name
    const targetLangName = LANGUAGES.find(l => l.code === targetLanguage)?.name || 'English';
    
    // Prepare the prompt
    const prompt = `You are a speech-to-text and translation AI. 
    
Listen to this audio file. First, detect the language spoken in the audio (it will be one of: English, Igbo, Hausa, or Yoruba). 
Then, transcribe the entire audio accurately. 
Finally, translate the transcription to ${targetLangName}.

Return your response in this exact JSON format without any additional text:
{
  "sourceLanguage": "the detected language code (en, ig, ha, or yo)",
  "text": "the translated transcription"
}

If there are multiple languages in the audio, detect the primary one.
If the audio is unclear or silent, return sourceLanguage as "unknown" and text as "Audio unclear or no speech detected".`;

    // Generate content with audio
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Audio
        }
      },
      prompt
    ]);
    
    const response = result.response;
    const responseText = response.text();
    
    // Parse JSON response
    try {
      const parsed = JSON.parse(responseText);
      return {
        sourceLanguage: parsed.sourceLanguage || 'unknown',
        text: parsed.text || 'No transcription generated',
        targetLanguage: targetLanguage
      };
    } catch (parseError) {
      // Fallback if Gemini doesn't return valid JSON
      return {
        sourceLanguage: 'unknown',
        text: responseText,
        targetLanguage: targetLanguage
      };
    }
  } catch (error) {
    console.error('Gemini transcription error:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
};

module.exports = { transcribeAudio };