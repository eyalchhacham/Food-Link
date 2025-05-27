const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/recommendations', async (req, res) => {
  const { userDescription } = req.body;

  try {
    // 1. Get all available donations from the DB
    const allDonations = await prisma.foodDonation.findMany({
      where: { status: 'available' },
      include: {
        user: true, // for full donation details
      },
    });

    // 2. Create simplified list for GPT
    const summarizedList = allDonations.map(d => ({
      id: d.id,
      productName: d.productName,
      description: d.description,
      category: d.category,
    }));

    // 3. Create prompt
    const prompt = `
User description:
${userDescription}

Available donations:
${JSON.stringify(summarizedList, null, 2)}

Instructions:
Choose the 3 most relevant donation IDs only (from the list above), based on the user description. 
Return a plain array of IDs as JSON: [12, 5, 7]
`;

    // 4. Ask GPT for donation IDs
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.choices[0].message.content;
    const matchedIds = JSON.parse(text.match(/\[.*?\]/)[0]);

    // 5. Fetch the matching full donations by ID
    const matchingDonations = await prisma.foodDonation.findMany({
      where: {
        id: { in: matchedIds },
      },
    });

    res.json({ matchingDonations });

  } catch (err) {
    console.error('AI recommendation error:', err);
    res.status(500).json({ error: 'AI recommendation failed' });
  }
});

module.exports = router;
