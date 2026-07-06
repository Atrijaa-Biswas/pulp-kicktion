import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/ai-engine';
import { dbAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const stream = await getChatResponse(message, context);
    
    if (typeof stream === 'string') {
      // It's a fallback error string
      return NextResponse.json({ error: stream }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          console.error("Stream error", err);
          controller.enqueue(encoder.encode("\n[Connection error]"));
        } finally {
          controller.close();
          
          // Process any actions in the background
          const actionMatch = fullResponse.match(/<ACTION>(.*?)<\/ACTION>/);
          if (actionMatch && actionMatch[1]) {
            try {
              const action = JSON.parse(actionMatch[1]);
              if (action.type === 'incident') {
                await dbAdmin.collection('incidents').add({
                  location: action.location,
                  description: action.description,
                  reportedAt: Date.now(),
                  status: 'open'
                });
                console.log("Logged incident to Firestore:", action);
              }
            } catch (e) {
              console.error("Failed to parse or save action", e);
            }
          }
        }
      }
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream' }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
