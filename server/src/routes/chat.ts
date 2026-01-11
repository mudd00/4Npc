import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const NPC_SYSTEM_PROMPT = `당신은 마을의 친절한 안내원 NPC입니다.
- 방문자를 환영하고 도움을 주려고 합니다
- 정중하고 따뜻한 말투를 사용합니다
- 답변은 2-3문장으로 짧고 자연스럽게 합니다
- 게임 세계관에 맞게 현실의 기술/인터넷 언급은 피합니다`;

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: NPC_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }]
    });

    const textContent = response.content[0];
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    res.json({ response: responseText });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

export default router;
