import express from 'express';
import { Conversation } from '../models/Conversation.js';
import OpenAI from 'openai';

export const router = express.Router();

// Initialize OpenAI client with exact matching configuration
const client = new OpenAI({
  baseURL: 'http://127.0.0.1:1235/v1',  // Ensure port is 1234
  apiKey: 'lm-studio',
  defaultHeaders: { 'Content-Type': 'application/json' }
});

// Get all conversations
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new conversation
router.post('/conversations', async (req, res) => {
  try {
    const conversation = new Conversation({
      title: req.body.title || 'New Conversation',
      messages: []
    });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation
    let conversation = conversationId ? 
      await Conversation.findById(conversationId) :
      new Conversation({ title: message.slice(0, 30) + '...', messages: [] });

    if (!conversation) {
      conversation = new Conversation({ 
        title: message.slice(0, 30) + '...', 
        messages: [] 
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    try {
      const apiPayload = {
        model: "meta_llama3.1_finetuned",
        messages: conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: -1,
        stream: false
      };

      console.log('Making API call to:', client.baseURL);
      console.log('With payload:', apiPayload);

      const completion = await client.chat.completions.create(apiPayload);

      console.log('Received API response:', completion);

      const aiResponse = completion.choices[0].message.content;
      
      // Add AI response
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      conversation.updatedAt = new Date();
      await conversation.save();

      res.json({
        message: aiResponse,
        conversation
      });

    } catch (apiError) {
      console.error('API call failed:', apiError);
      
      // Fallback response in case of API failure
      const fallbackResponse = "I apologize, but I'm having trouble connecting to the AI service at the moment. Please try again later.";
      
      conversation.messages.push({
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      });

      conversation.updatedAt = new Date();
      await conversation.save();

      res.json({
        message: fallbackResponse,
        conversation
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversation by id
router.get('/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete conversation
router.delete('/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update conversation title
router.patch('/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (req.body.title) {
      conversation.title = req.body.title;
      await conversation.save();
    }

    res.json(conversation);
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});