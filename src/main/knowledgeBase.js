// 本地知识库检索相关逻辑（txt支持，embedding+检索）
const fs = require('fs');
const path = require('path');
const use = require('@tensorflow-models/universal-sentence-encoder');
const tf = require('@tensorflow/tfjs-node');

let knowledgeBase = []; // {id, text, embedding}
let model = null;

// 加载 embedding 模型（全局只加载一次）
async function getModel() {
  if (!model) {
    model = await use.load();
  }
  return model;
}

// 分段：每段约300字
function splitTextToChunks(text, chunkSize = 300) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize;
  }
  return chunks;
}

// 加载txt文件并生成知识库
async function loadTxtKnowledgeBase(txtFilePath) {
  const absPath = path.resolve(txtFilePath);
  const content = fs.readFileSync(absPath, 'utf-8');
  const chunks = splitTextToChunks(content);
  const m = await getModel();
  const embeddings = await m.embed(chunks);
  const embArray = await embeddings.array();
  knowledgeBase = chunks.map((text, i) => ({
    id: i,
    text,
    embedding: embArray[i]
  }));
}

// 余弦相似度
function cosineSimilarity(vecA, vecB) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 检索知识库
async function searchKnowledgeBase(query, topN = 3) {
  if (!knowledgeBase.length) return [];
  const m = await getModel();
  const queryEmb = await m.embed([query]);
  const queryVec = (await queryEmb.array())[0];
  const scored = knowledgeBase.map(item => ({
    ...item,
    score: cosineSimilarity(queryVec, item.embedding)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map(item => item.text);
}

// 添加知识条目（自动生成embedding）
async function addKnowledgeEntry(text) {
  const m = await getModel();
  const emb = await m.embed([text]);
  const vec = (await emb.array())[0];
  knowledgeBase.push({
    id: knowledgeBase.length,
    text,
    embedding: vec
  });
}

// 清空知识库
function clearKnowledgeBase() {
  knowledgeBase = [];
}

module.exports = {
  loadTxtKnowledgeBase,
  searchKnowledgeBase,
  addKnowledgeEntry,
  clearKnowledgeBase
};
