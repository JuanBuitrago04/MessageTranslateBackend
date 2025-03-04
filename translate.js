const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

const MODEL_MAP = {
  'en': 'Helsinki-NLP/opus-mt-es-en',
  'fr': 'Helsinki-NLP/opus-mt-es-fr',
  'de': 'Helsinki-NLP/opus-mt-es-de',
  'it': 'Helsinki-NLP/opus-mt-es-it',
  'pt': 'Helsinki-NLP/opus-mt-es-pt'
};

async function translateText(text, targetLang) {
    const model = MODEL_MAP[targetLang];
    if (!model) {
        throw new Error(`El idioma "${targetLang}" no es soportado.`);
    }

    const url = `https://api-inference.huggingface.co/models/${model}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${HUGGINGFACE_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: text })
        });
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Error en la respuesta de Hugging Face:", errorBody);
            return null;
        }
        
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0 && data[0].translation_text) {
            return data[0].translation_text;
        } else {
            console.error("Respuesta de traducción inválida:", data);
            return null;
        }
    } catch (error) {
        console.error("Error al traducir el texto:", error);
        return null;
    }
}

module.exports = { translateText };