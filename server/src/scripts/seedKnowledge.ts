/**
 * 지식 데이터 시딩 스크립트
 *
 * 사용법:
 * cd server
 * npx ts-node src/scripts/seedKnowledge.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// 환경변수 먼저 로드
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import * as embeddingService from '../services/embeddingService';
import * as vectorStore from '../services/vectorStore';
import knowledgeData from '../data/knowledge.json';

interface KnowledgeDoc {
  category: string;
  title: string;
  content: string;
}

async function seed() {
  console.log('=== 지식 데이터 시딩 시작 ===\n');
  console.log(`세계관: ${knowledgeData.worldName}`);
  console.log(`총 문서 수: ${knowledgeData.documents.length}\n`);

  // 기존 데이터 삭제 (선택사항)
  console.log('기존 데이터 삭제 중...');
  await vectorStore.clearAll();

  const documents = knowledgeData.documents as KnowledgeDoc[];

  // 임베딩 생성을 위한 텍스트 준비
  const texts = documents.map(doc => `${doc.title}\n${doc.content}`);

  console.log('임베딩 생성 중...');
  const embeddings = await embeddingService.embedBatch(texts);
  console.log(`${embeddings.length}개 임베딩 생성 완료\n`);

  // 문서와 임베딩 결합
  const docsWithEmbeddings = documents.map((doc, index) => ({
    category: doc.category,
    title: doc.title,
    content: doc.content,
    embedding: embeddings[index],
    metadata: { worldName: knowledgeData.worldName },
  }));

  // 일괄 삽입
  console.log('데이터베이스에 저장 중...');
  const success = await vectorStore.insertBatch(docsWithEmbeddings);

  if (success) {
    console.log('\n=== 시딩 완료! ===');
    console.log(`- history: ${documents.filter(d => d.category === 'history').length}개`);
    console.log(`- location: ${documents.filter(d => d.category === 'location').length}개`);
    console.log(`- npc: ${documents.filter(d => d.category === 'npc').length}개`);
    console.log(`- rumor: ${documents.filter(d => d.category === 'rumor').length}개`);
  } else {
    console.error('\n시딩 실패!');
    process.exit(1);
  }
}

seed().catch(console.error);
