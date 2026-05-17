// app/api/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { HookItem } from '@/lib/types';

const SYSTEM_PROMPT = `你是一位顶尖的内容营销专家，专门为各大内容平台撰写爆款开头 Hook。
你必须严格按照 JSON 格式返回结果，不附加任何解释文字。

平台特点参考：
- 小红书：年轻女性为主，语气亲切真实，多用 emoji 和口语化表达
- 抖音：快节奏，前 3 秒抓人，语气强冲击力
- B站：Z 世代，梗文化，可以幽默/中二
- YouTube：信息密度高，专业感，中长句
- X（Twitter）：极简犀利，一句话炸裂

每个 Hook 必须：
- 长度 20-60 字
- 符合指定平台的调性和用户画像
- 真正有"让人忍不住想点开"的冲击力`;

function allocateStyles(styles: string[], total: number): string[] {
  const n = styles.length;
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  const allocation: string[] = [];
  for (let i = 0; i < n; i++) {
    const count = i < remainder ? base + 1 : base;
    for (let j = 0; j < count; j++) {
      allocation.push(styles[i]);
    }
  }
  return allocation;
}

function extractJson(text: string): string {
  // 剥离 markdown 代码块
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
  }
  // 处理末尾逗号
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, platform, contentType, styles, apiKey, baseUrl, model } = body;

    // 参数校验
    if (!topic?.trim()) {
      return NextResponse.json({ error: '请输入主题' }, { status: 400 });
    }
    if (!apiKey?.trim()) {
      return NextResponse.json({ error: '请先配置 API Key' }, { status: 401 });
    }
    if (!styles?.length) {
      return NextResponse.json({ error: '请至少选择一种风格' }, { status: 400 });
    }

    const styleAllocation = allocateStyles(styles, 10);

    const platformLabels: Record<string, string> = {
      xiaohongshu: '小红书', douyin: '抖音', bilibili: 'B站',
      youtube: 'YouTube', x: 'X',
    };
    const contentTypeLabels: Record<string, string> = {
      video: '视频', 'image-text': '图文', 'product-ad': '产品广告',
      tutorial: '教程', opinion: '观点帖',
    };
    const styleLabels: Record<string, string> = {
      'suspense-question': '悬念提问', 'counter-intuitive': '反常识',
      'pain-point': '痛点直击', 'numbered-list': '数字清单',
      'empathy': '情感共鸣', 'contrast': '对比冲击',
      'identity-label': '身份标签', 'result-promise': '结果承诺',
      'curiosity-gap': '好奇缺口', 'social-currency': '社交货币',
      'story-hook': '故事钩子', 'controversy': '争议挑逗',
    };

    const styleList = styleAllocation
      .map((s, i) => `${i + 1}. ${styleLabels[s] || s}`)
      .join('\n');

    const userMessage = `主题：${topic.trim()}
平台：${platformLabels[platform] || platform}
内容类型：${contentTypeLabels[contentType] || contentType}
要求：生成 10 条 Hook，按以下顺序分配风格（每条对应一个风格）：
${styleList}

返回一个纯 JSON 对象：
{
  "hooks": [
    { "content": "Hook文案", "style": "风格名称（中文）", "score": 8.5, "reason": "一句话解释为什么这个hook有效" }
  ]
}
score 为 0.0-10.0 的点击欲评分，客观评估。必须恰好返回 10 条。`;

    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl || 'https://api.deepseek.com/v1',
      timeout: 60000,
    });

    const completion = await client.chat.completions.create({
      model: model || 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.9,
      max_tokens: 4096,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: 'AI 未返回内容，请重试' }, { status: 502 });
    }

    let parsed: { hooks: HookItem[] };
    try {
      parsed = JSON.parse(extractJson(rawContent));
    } catch {
      return NextResponse.json({
        error: 'AI 返回格式异常，请重试',
        raw: rawContent.slice(0, 500),
      }, { status: 502 });
    }

    if (!parsed.hooks || !Array.isArray(parsed.hooks)) {
      return NextResponse.json({ error: 'AI 返回格式异常，请重试' }, { status: 502 });
    }

    // 补齐 ID
    const hooks: HookItem[] = parsed.hooks.slice(0, 10).map((h, i) => ({
      id: `hook-${Date.now()}-${i}`,
      content: h.content || '',
      style: h.style || styleAllocation[i] || '未知',
      score: typeof h.score === 'number' ? Math.min(10, Math.max(0, h.score)) : 7.0,
      reason: h.reason || '',
    }));

    // 补齐不足 10 条（极端情况）
    while (hooks.length < 10) {
      hooks.push({
        id: `hook-${Date.now()}-${hooks.length}`,
        content: '生成失败，请重试',
        style: '未知',
        score: 0,
        reason: '此条生成时出现异常',
      });
    }

    return NextResponse.json({
      hooks,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '服务器内部错误';
    const status =
      (err as { status?: number }).status === 401 ? 401 :
      (err as { status?: number }).status === 429 ? 429 :
      500;

    if (status === 401) {
      return NextResponse.json({ error: 'API Key 无效，请检查后重试' }, { status: 401 });
    }
    if (status === 429) {
      return NextResponse.json({ error: '服务繁忙，请稍后重试或切换厂商' }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
