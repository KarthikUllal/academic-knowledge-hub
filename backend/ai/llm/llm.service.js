
/**
 * Purpose: Generate AI responses using the NVIDIA Nemotron LLM.
 */

const axios = require("axios");
require("dotenv").config();

// Generate an answer using the NVIDIA LLM
const generateAnswer = async (prompt) => {
  try {
    // Support both plain string prompts and message arrays
    const messages = Array.isArray(prompt)
      ? prompt
      : [
          {
            role: "user",
            content: prompt,
          },
        ];

    const response = await axios.post(
      `${process.env.NVIDIA_BASE_URL}/chat/completions`,
      {
        model: process.env.NVIDIA_LLM_MODEL,
        messages,
        max_tokens: 2048,
        chat_template_kwargs: {
          thinking: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "LLM response generation failed:",
      error.response?.data || error.message
    );

    throw new Error("Failed to generate AI response");
  }
};

module.exports = { generateAnswer };
