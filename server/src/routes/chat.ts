import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import * as embeddingService from '../services/embeddingService';
import * as vectorStore from '../services/vectorStore';
import * as memoryService from '../services/memoryService';
import * as affinityService from '../services/affinityService';

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// NPC별 시스템 프롬프트
// ============================================

// Level 1: 밤이 (졸린 경비원) - 기본 API, 기억 없음
const LEVEL1_PROMPT = `당신은 '별빛 마을'의 졸린 경비원 '밤이'입니다.

## 성격
- 항상 졸려 보이고 하품을 자주 합니다
- 무뚝뚝하지만 마음은 따뜻합니다
- 밤에 마을을 지키느라 낮에는 졸립니다
- 말투가 느릿느릿하고 "음...", "어..." 같은 말을 자주 합니다

## 대화 규칙
- 답변은 1-3문장으로 짧게 합니다
- 가끔 하품(🥱)을 섞어서 대화합니다
- 마을 보안에 관한 이야기는 잘 합니다
- 깊은 대화는 피곤해서 못 한다고 합니다`;

// Level 2: 루나 (마을 안내원) - RAG 기반
const LEVEL2_PROMPT = `당신은 '별빛 마을'의 친절한 안내원 '루나'입니다.

## 성격
- 이 마을에서 태어나고 자란 토박이로, 마을을 사랑합니다
- 방문객을 환영하고 친절하게 도움을 주려 합니다
- 정중하고 따뜻한 말투를 사용합니다
- 가끔 마을의 재미있는 이야기나 소문을 들려주기도 합니다

## 대화 규칙
- 답변은 2-4문장으로 자연스럽게 합니다
- 게임 세계관에 맞게 현실의 기술/인터넷 언급은 피합니다
- 아래 "참고 지식"에 있는 정보를 활용해 답변하세요
- 참고 지식에 없는 내용은 "잘 모르겠어요"라고 솔직하게 말합니다`;

// Level 3: 해나 (친근한 상인) - Memory 시스템
const LEVEL3_PROMPT = `당신은 '별빛 마을'의 친근한 상인 '해나'입니다.

## 성격
- 밝고 에너지가 넘칩니다
- 손님과의 대화를 좋아합니다
- 물건을 팔 때 열정적으로 설명합니다
- 단골손님을 기억하고 친근하게 대합니다

## 대화 규칙
- 답변은 2-4문장으로 활기차게 합니다
- 이전 대화 내용을 기억하고 언급합니다
- "~요!", "~죠!" 같은 밝은 말투를 사용합니다
- 물건 추천을 자연스럽게 섞습니다`;

// Level 4: 별이 (신비로운 점술가) - Personality 시스템
const LEVEL4_PROMPT = `당신은 '별빛 마을'의 신비로운 점술가 '별이'입니다.

## 기본 성격
- 신비롭고 조용한 분위기를 풍깁니다
- 별과 운명에 대해 이야기하는 것을 좋아합니다
- 점술과 별자리에 대한 지식이 풍부합니다
- 마음을 여는 데 시간이 걸리는 성격입니다

## 말투 특징
- "...운명이...", "별이 말하길...", "...그래요" 같은 표현을 자주 사용합니다
- 문장 앞에 "..."을 붙여 신비로운 느낌을 줍니다
- 게임 세계관에 맞게 현실의 기술/인터넷 언급은 피합니다
- *행동* 같은 묘사는 사용하지 않고, 대사만 합니다`;

// 카테고리별 질문 템플릿 (quick-info 용)
const CATEGORY_PROMPTS: Record<string, string> = {
  history: '이 마을의 역사에 대해 간단히 알려주세요',
  location: '이 마을에서 가볼 만한 장소를 추천해주세요',
  npc: '마을에 어떤 분들이 살고 계신가요?',
  rumor: '마을에서 들리는 재미있는 소문이 있나요?',
};

// ============================================
// Level 1: 기본 API (밤이) - 스트리밍
// ============================================
router.post('/chat/level1/stream', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: LEVEL1_PROMPT,
      messages: [{ role: 'user', content: message }]
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Level 1 stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to get response' })}\n\n`);
    res.end();
  }
});

// ============================================
// Level 1: 기본 API (밤이) - 일반 (하위호환)
// ============================================
router.post('/chat/level1', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: LEVEL1_PROMPT,
      messages: [{ role: 'user', content: message }]
    });

    const textContent = response.content[0];
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    res.json({ response: responseText });
  } catch (error) {
    console.error('Level 1 chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

// ============================================
// Level 2: RAG 기반 (루나) - 스트리밍
// ============================================
router.post('/chat/level2/stream', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // 1. 사용자 질문 임베딩
    const queryEmbedding = await embeddingService.embed(message);

    // 2. 관련 지식 검색
    const relevantDocs = await vectorStore.search(queryEmbedding, 3, 0.5);

    // 3. 컨텍스트 구성
    let context = '';
    if (relevantDocs.length > 0) {
      context = '\n\n## 참고 지식:\n' + relevantDocs
        .map(doc => `[${doc.category}] ${doc.title}: ${doc.content}`)
        .join('\n\n');
    }

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: LEVEL2_PROMPT + context,
      messages: [{ role: 'user', content: message }]
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Level 2 stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to get response' })}\n\n`);
    res.end();
  }
});

// ============================================
// Level 2: RAG 기반 (루나) - 일반 (하위호환)
// ============================================
router.post('/chat/level2', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // 1. 사용자 질문 임베딩
    const queryEmbedding = await embeddingService.embed(message);

    // 2. 관련 지식 검색
    const relevantDocs = await vectorStore.search(queryEmbedding, 3, 0.5);

    // 3. 컨텍스트 구성
    let context = '';
    if (relevantDocs.length > 0) {
      context = '\n\n## 참고 지식:\n' + relevantDocs
        .map(doc => `[${doc.category}] ${doc.title}: ${doc.content}`)
        .join('\n\n');
    }

    // 4. Claude API 호출 (컨텍스트 포함)
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: LEVEL2_PROMPT + context,
      messages: [{ role: 'user', content: message }]
    });

    const textContent = response.content[0];
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    res.json({
      response: responseText,
      sources: relevantDocs.map(d => ({ category: d.category, title: d.title })),
    });
  } catch (error) {
    console.error('Level 2 chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

// ============================================
// Level 3: Memory 시스템 (해나) - 스트리밍
// ============================================
router.post('/chat/level3/stream', async (req: Request, res: Response) => {
  try {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const finalUserId = userId || 'anonymous';
    const npcId = 'npc-level3';

    // 1. 이전 대화 기록 조회
    const previousConversations = await memoryService.getRecentConversations(
      finalUserId,
      npcId,
      10
    );
    const conversationHistory = memoryService.formatConversationHistory(previousConversations);

    // 2. 유저 요약 정보 조회
    const userSummary = await memoryService.getUserSummary(finalUserId, npcId);

    // 3. RAG 검색
    const queryEmbedding = await embeddingService.embed(message);
    const relevantDocs = await vectorStore.search(queryEmbedding, 2, 0.5);

    // 4. 첫 방문 감지
    const isFirstVisit = previousConversations.length === 0;

    // 5. 컨텍스트 구성
    let context = '';
    if (isFirstVisit) {
      context += '\n\n## 상황:\n처음 온 손님입니다. 반갑게 인사하고 이름을 물어보세요.';
    } else {
      if (userSummary) {
        context += `\n\n## 이 손님에 대해 기억하는 것:\n${userSummary}`;
      }
      if (conversationHistory) {
        context += `\n\n## 최근 대화 기록:\n${conversationHistory}`;
      }
    }
    if (relevantDocs.length > 0) {
      context += '\n\n## 참고 지식:\n' + relevantDocs
        .map(doc => `[${doc.category}] ${doc.title}: ${doc.content}`)
        .join('\n\n');
    }

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 6. Claude 스트리밍 호출
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: LEVEL3_PROMPT + context,
      messages: [{ role: 'user', content: message }]
    });

    let fullResponse = '';

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullResponse += event.delta.text;
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    // 7. 대화 기록 저장 (스트리밍 완료 후)
    await memoryService.saveConversation(finalUserId, npcId, message, fullResponse);

    // 8. 특정 조건에서 유저 요약 업데이트
    if (previousConversations.length > 0 && previousConversations.length % 10 === 0) {
      const summaryResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: '대화 내용을 바탕으로 이 손님에 대한 핵심 정보를 2-3문장으로 요약해주세요.',
        messages: [{
          role: 'user',
          content: `대화 기록:\n${conversationHistory}\n\n최신 대화:\n손님: ${message}\n해나: ${fullResponse}`
        }]
      });

      const summaryContent = summaryResponse.content[0];
      const newSummary = summaryContent?.type === 'text' ? summaryContent.text : '';
      if (newSummary) {
        await memoryService.updateUserSummary(finalUserId, npcId, newSummary);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Level 3 stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to get response' })}\n\n`);
    res.end();
  }
});

// ============================================
// Level 3: Memory 시스템 (해나) - 일반 (하위호환)
// ============================================
router.post('/chat/level3', async (req: Request, res: Response) => {
  try {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // userId가 없으면 임시 ID 사용
    const finalUserId = userId || 'anonymous';
    const npcId = 'npc-level3';

    // 1. 이전 대화 기록 조회
    const previousConversations = await memoryService.getRecentConversations(
      finalUserId,
      npcId,
      10 // 최근 10개 메시지
    );
    const conversationHistory = memoryService.formatConversationHistory(previousConversations);

    // 2. 유저 요약 정보 조회
    const userSummary = await memoryService.getUserSummary(finalUserId, npcId);

    // 3. RAG 검색 (선택적)
    const queryEmbedding = await embeddingService.embed(message);
    const relevantDocs = await vectorStore.search(queryEmbedding, 2, 0.5);

    // 4. 첫 방문 감지
    const isFirstVisit = previousConversations.length === 0;

    // 5. 컨텍스트 구성
    let context = '';

    if (isFirstVisit) {
      context += '\n\n## 상황:\n처음 온 손님입니다. 반갑게 인사하고 이름을 물어보세요.';
    } else {
      if (userSummary) {
        context += `\n\n## 이 손님에 대해 기억하는 것:\n${userSummary}`;
      }

      if (conversationHistory) {
        context += `\n\n## 최근 대화 기록:\n${conversationHistory}`;
      }
    }

    if (relevantDocs.length > 0) {
      context += '\n\n## 참고 지식:\n' + relevantDocs
        .map(doc => `[${doc.category}] ${doc.title}: ${doc.content}`)
        .join('\n\n');
    }

    // 6. Claude API 호출
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: LEVEL3_PROMPT + context,
      messages: [{ role: 'user', content: message }]
    });

    const textContent = response.content[0];
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    // 7. 대화 기록 저장
    await memoryService.saveConversation(finalUserId, npcId, message, responseText);

    // 8. 특정 조건에서 유저 요약 업데이트 (10번째 대화마다)
    if (previousConversations.length > 0 && previousConversations.length % 10 === 0) {
      // 요약 생성 요청
      const summaryResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: '대화 내용을 바탕으로 이 손님에 대한 핵심 정보를 2-3문장으로 요약해주세요. 이름, 관심사, 특징 등을 포함하세요.',
        messages: [{
          role: 'user',
          content: `대화 기록:\n${conversationHistory}\n\n최신 대화:\n손님: ${message}\n해나: ${responseText}`
        }]
      });

      const summaryContent = summaryResponse.content[0];
      const newSummary = summaryContent?.type === 'text' ? summaryContent.text : '';

      if (newSummary) {
        await memoryService.updateUserSummary(finalUserId, npcId, newSummary);
      }
    }

    res.json({
      response: responseText,
      isFirstVisit,
      hasMemory: previousConversations.length > 0,
      conversationCount: previousConversations.length + 2,
    });
  } catch (error) {
    console.error('Level 3 chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

// ============================================
// Level 3: 대화 시작 - 스트리밍 (채팅창 열릴 때 자동 호출)
// ============================================
router.post('/chat/level3/start/stream', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const finalUserId = userId || 'anonymous';
    const npcId = 'npc-level3';

    // 이전 대화 기록 조회
    const previousConversations = await memoryService.getRecentConversations(
      finalUserId,
      npcId,
      10
    );
    const conversationHistory = memoryService.formatConversationHistory(previousConversations);
    const userSummary = await memoryService.getUserSummary(finalUserId, npcId);
    const isFirstVisit = previousConversations.length === 0;

    // 컨텍스트 구성
    let context = '';
    if (isFirstVisit) {
      context += '\n\n## 상황:\n처음 온 손님입니다. 반갑게 인사하고 이름을 물어보세요.';
    } else {
      if (userSummary) {
        context += `\n\n## 이 손님에 대해 기억하는 것:\n${userSummary}`;
      }
      if (conversationHistory) {
        context += `\n\n## 최근 대화 기록:\n${conversationHistory}`;
      }
      context += '\n\n## 상황:\n다시 온 손님입니다. 반갑게 맞이하고 기억하는 내용을 자연스럽게 언급하세요.';
    }

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: LEVEL3_PROMPT + context,
      messages: [{ role: 'user', content: '(손님이 가게에 들어왔습니다)' }]
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Level 3 start stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to get response' })}\n\n`);
    res.end();
  }
});

// ============================================
// Level 3: 대화 시작 - 일반 (하위호환)
// ============================================
router.post('/chat/level3/start', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const finalUserId = userId || 'anonymous';
    const npcId = 'npc-level3';

    // 이전 대화 기록 조회
    const previousConversations = await memoryService.getRecentConversations(
      finalUserId,
      npcId,
      10
    );
    const conversationHistory = memoryService.formatConversationHistory(previousConversations);

    // 유저 요약 정보 조회
    const userSummary = await memoryService.getUserSummary(finalUserId, npcId);

    // 첫 방문 감지
    const isFirstVisit = previousConversations.length === 0;

    // 컨텍스트 구성
    let context = '';

    if (isFirstVisit) {
      context += '\n\n## 상황:\n처음 온 손님입니다. 반갑게 인사하고 이름을 물어보세요.';
    } else {
      if (userSummary) {
        context += `\n\n## 이 손님에 대해 기억하는 것:\n${userSummary}`;
      }
      if (conversationHistory) {
        context += `\n\n## 최근 대화 기록:\n${conversationHistory}`;
      }
      context += '\n\n## 상황:\n다시 온 손님입니다. 반갑게 맞이하고 기억하는 내용을 자연스럽게 언급하세요.';
    }

    // Claude API 호출 (NPC가 먼저 인사)
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: LEVEL3_PROMPT + context,
      messages: [{ role: 'user', content: '(손님이 가게에 들어왔습니다)' }]
    });

    const textContent = response.content[0];
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    res.json({
      response: responseText,
      isFirstVisit,
      hasMemory: previousConversations.length > 0,
    });
  } catch (error) {
    console.error('Level 3 start error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

// ============================================
// Level 4: Personality 시스템 (별이) - 스트리밍 + 메모리
// ============================================
router.post('/chat/level4/stream', async (req: Request, res: Response) => {
  try {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const finalUserId = userId || 'anonymous';
    const npcId = 'npc-level4';

    // 1. 호감도 조회
    const affinityData = await affinityService.getAffinity(finalUserId, npcId);
    const personalityPrompt = affinityService.getPersonalityPrompt(affinityData);

    // 2. 이전 대화 기록 조회 (메모리)
    const previousConversations = await memoryService.getRecentConversations(finalUserId, npcId, 10);
    const conversationHistory = previousConversations
      .map((msg) => `${msg.role === 'user' ? '손님' : '별이'}: ${msg.content}`)
      .join('\n');

    // 3. 유저 요약 정보 조회
    const userSummary = await memoryService.getUserSummary(finalUserId, npcId);

    // 4. 컨텍스트 구성
    let memoryContext = '';
    if (userSummary) {
      memoryContext += `\n\n## 이 손님에 대해 기억하는 것:\n${userSummary}`;
    }
    if (conversationHistory) {
      memoryContext += `\n\n## 최근 대화 기록:\n${conversationHistory}`;
    }

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 5. Claude 스트리밍 호출
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: LEVEL4_PROMPT + personalityPrompt + memoryContext,
      messages: [{ role: 'user', content: message }]
    });

    let fullResponse = '';

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullResponse += event.delta.text;
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    // 6. 대화 기록 저장
    await memoryService.saveConversation(finalUserId, npcId, message, fullResponse);

    // 7. 호감도 변화 분석 (동기 처리로 변경하여 결과 전송)
    const affinityResult = await analyzeAndUpdateAffinity(
      finalUserId,
      npcId,
      message,
      affinityData.affinityScore
    );

    // 8. 호감도 정보 전송 (변화량 + 이유 포함)
    if (affinityResult) {
      res.write(`data: ${JSON.stringify({
        affinity: affinityResult.newScore,
        affinityLevel: affinityService.getAffinityLevelName(affinityResult.newLevel),
        affinityDelta: affinityResult.delta,
        affinityOldLevel: affinityResult.oldLevel,
        affinityNewLevel: affinityResult.newLevel,
        levelChanged: affinityResult.oldLevel !== affinityResult.newLevel,
        affinityReason: affinityResult.reason,
      })}\n\n`);
    } else {
      // 분석 실패 시 현재 값 전송
      res.write(`data: ${JSON.stringify({
        affinity: affinityData.affinityScore,
        affinityLevel: affinityService.getAffinityLevelName(affinityData.affinityLevel),
        affinityDelta: 0,
        affinityReason: '',
      })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Level 4 stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to get response' })}\n\n`);
    res.end();
  }
});

// 호감도 분석 결과 타입
interface AffinityUpdateResult {
  delta: number;
  newScore: number;
  oldScore: number;
  reason: string;
  oldLevel: affinityService.AffinityLevel;
  newLevel: affinityService.AffinityLevel;
}

// 호감도 분석 및 업데이트 헬퍼 함수
async function analyzeAndUpdateAffinity(
  userId: string,
  npcId: string,
  userMessage: string,
  currentAffinityScore: number
): Promise<AffinityUpdateResult | null> {
  try {
    // 현재 호감도 단계에 맞는 분석 프롬프트 사용
    const analysisPrompt = affinityService.getAffinityAnalysisPrompt(currentAffinityScore);

    const analysisResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      system: analysisPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    const analysisContent = analysisResponse.content[0];
    const analysisText = analysisContent?.type === 'text' ? analysisContent.text : '';

    // JSON 파싱
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      if (typeof analysis.delta === 'number') {
        const oldLevel = affinityService.getAffinityLevel(currentAffinityScore);
        const newScore = await affinityService.updateAffinity(userId, npcId, analysis.delta);
        const newLevel = affinityService.getAffinityLevel(newScore);

        console.log(`Affinity updated: ${analysis.delta} (${analysis.reason})`);

        return {
          delta: analysis.delta,
          newScore,
          oldScore: currentAffinityScore,
          reason: analysis.reason || '',
          oldLevel,
          newLevel,
        };
      }
    }
    return null;
  } catch (err) {
    console.error('Affinity analysis error:', err);
    return null;
  }
}

// ============================================
// Level 4: Personality 시스템 (별이) - 일반 (하위호환)
// ============================================
router.post('/chat/level4', async (req: Request, res: Response) => {
  try {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const finalUserId = userId || 'anonymous';
    const npcId = 'npc-level4';

    // 1. 호감도 조회
    const affinityData = await affinityService.getAffinity(finalUserId, npcId);
    const personalityPrompt = affinityService.getPersonalityPrompt(affinityData);

    // 2. Claude API 호출
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: LEVEL4_PROMPT + personalityPrompt,
      messages: [{ role: 'user', content: message }]
    });

    const textContent = response.content[0];
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    // 3. 호감도 변화 분석 (비동기, 현재 호감도 단계 전달)
    analyzeAndUpdateAffinity(finalUserId, npcId, message, affinityData.affinityScore).catch(err => {
      console.error('Affinity update error:', err);
    });

    res.json({
      response: responseText,
      affinity: affinityData.affinityScore,
      affinityLevel: affinityService.getAffinityLevelName(affinityData.affinityLevel),
    });
  } catch (error) {
    console.error('Level 4 chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

// ============================================
// Level 4: 대화 시작 - 스트리밍 + 메모리 (채팅창 열릴 때 자동 호출)
// ============================================
router.post('/chat/level4/start/stream', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const finalUserId = userId || 'anonymous';
    const npcId = 'npc-level4';

    // 호감도 조회
    const affinityData = await affinityService.getAffinity(finalUserId, npcId);
    const personalityPrompt = affinityService.getPersonalityPrompt(affinityData);

    // 이전 대화 기록 조회 (메모리)
    const previousConversations = await memoryService.getRecentConversations(finalUserId, npcId, 10);
    const conversationHistory = previousConversations
      .map((msg) => `${msg.role === 'user' ? '손님' : '별이'}: ${msg.content}`)
      .join('\n');
    const userSummary = await memoryService.getUserSummary(finalUserId, npcId);
    const isFirstVisit = previousConversations.length === 0;

    // 컨텍스트 구성
    let memoryContext = '';
    if (isFirstVisit) {
      memoryContext += '\n\n## 상황:\n처음 온 손님입니다.';
    } else {
      if (userSummary) {
        memoryContext += `\n\n## 이 손님에 대해 기억하는 것:\n${userSummary}`;
      }
      if (conversationHistory) {
        memoryContext += `\n\n## 최근 대화 기록:\n${conversationHistory}`;
      }
      memoryContext += '\n\n## 상황:\n다시 온 손님입니다. 기억하는 내용을 자연스럽게 언급하세요.';
    }

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: LEVEL4_PROMPT + personalityPrompt + memoryContext,
      messages: [{ role: 'user', content: '(손님이 점술소에 들어왔습니다)' }]
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    // 호감도 정보 전송
    res.write(`data: ${JSON.stringify({
      affinity: affinityData.affinityScore,
      affinityLevel: affinityService.getAffinityLevelName(affinityData.affinityLevel)
    })}\n\n`);

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Level 4 start stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to get response' })}\n\n`);
    res.end();
  }
});

// ============================================
// 기존 /chat 엔드포인트 (하위 호환용 - Level 2로 라우팅)
// ============================================
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const queryEmbedding = await embeddingService.embed(message);
    const relevantDocs = await vectorStore.search(queryEmbedding, 3, 0.5);

    let context = '';
    if (relevantDocs.length > 0) {
      context = '\n\n## 참고 지식:\n' + relevantDocs
        .map(doc => `[${doc.category}] ${doc.title}: ${doc.content}`)
        .join('\n\n');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: LEVEL2_PROMPT + context,
      messages: [{ role: 'user', content: message }]
    });

    const textContent = response.content[0];
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    res.json({
      response: responseText,
      sources: relevantDocs.map(d => ({ category: d.category, title: d.title })),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

// ============================================
// 관계 상태 조회 API
// ============================================

// 특정 NPC와의 관계 상태 조회 (메모리 + 호감도)
router.post('/relationship-status', async (req: Request, res: Response) => {
  try {
    const { userId, npcId, level } = req.body;

    if (!userId || !npcId) {
      res.status(400).json({ error: 'userId and npcId are required' });
      return;
    }

    let hasMemory = false;
    let affinity = null;
    let affinityLevel = null;

    // Level 3+: 메모리 확인
    if (level >= 3) {
      const conversations = await memoryService.getRecentConversations(userId, npcId, 1);
      hasMemory = conversations.length > 0;
    }

    // Level 4: 호감도 확인
    if (level === 4) {
      const affinityData = await affinityService.getAffinity(userId, npcId);
      affinity = affinityData.affinityScore;
      affinityLevel = affinityData.affinityLevel;
    }

    res.json({
      hasMemory,
      affinity,
      affinityLevel,
    });
  } catch (error) {
    console.error('Relationship status error:', error);
    res.status(500).json({ error: 'Failed to get relationship status' });
  }
});

// ============================================
// 리셋 API (데모용)
// ============================================

// 특정 NPC와의 관계 초기화 (메모리 + 호감도)
router.post('/reset', async (req: Request, res: Response) => {
  try {
    const { userId, npcId } = req.body;

    if (!userId || !npcId) {
      res.status(400).json({ error: 'userId and npcId are required' });
      return;
    }

    // 메모리 초기화
    const memoryReset = await memoryService.resetMemory(userId, npcId);

    // 호감도 초기화 (Level 4만 해당)
    const affinityReset = await affinityService.resetAffinity(userId, npcId);

    console.log(`Reset completed for ${userId}/${npcId} - memory: ${memoryReset}, affinity: ${affinityReset}`);

    res.json({
      success: true,
      memoryReset,
      affinityReset,
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Failed to reset' });
  }
});

// POST /api/quick-info - 카테고리별 빠른 정보 (말풍선용)
router.post('/quick-info', async (req: Request, res: Response) => {
  try {
    const { category } = req.body;

    if (!category || !['history', 'location', 'npc', 'rumor'].includes(category)) {
      res.status(400).json({ error: 'Valid category required: history, location, npc, rumor' });
      return;
    }

    // 카테고리 기본 질문으로 임베딩 생성
    const queryText = CATEGORY_PROMPTS[category];
    const queryEmbedding = await embeddingService.embed(queryText);

    // 카테고리별 검색 (랜덤성을 위해 여러 개 가져온 후 하나 선택)
    const docs = await vectorStore.searchByCategory(queryEmbedding, category, 3);

    if (docs.length === 0) {
      res.json({ response: '음... 지금은 떠오르는 게 없네요.' });
      return;
    }

    // 랜덤하게 하나 선택
    const selectedDoc = docs[Math.floor(Math.random() * docs.length)];

    // 짧은 응답 생성 (Claude 사용)
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: `당신은 별빛 마을의 안내원 루나입니다.
아래 정보를 바탕으로 1-2문장의 짧고 친근한 대사로 말해주세요.
마치 게임 NPC가 말풍선으로 대화하는 것처럼 자연스럽게요.`,
      messages: [{
        role: 'user',
        content: `다음 정보를 짧게 소개해주세요:\n\n제목: ${selectedDoc.title}\n내용: ${selectedDoc.content}`
      }]
    });

    const textContent = response.content[0];
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    res.json({
      response: responseText,
      category: selectedDoc.category,
      title: selectedDoc.title,
    });
  } catch (error) {
    console.error('Quick info error:', error);
    res.status(500).json({ error: 'Failed to get info' });
  }
});

export default router;
