const BASE = '/api/chat';

/**
 * Send a chat message and receive a streaming response.
 * Returns an async generator that yields text chunks.
 */
export async function* sendChatMessage(messages, token, isDailySummary = false) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, isDailySummary }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send message');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      const data = JSON.parse(line.slice(6));

      if (data.type === 'text') {
        yield data.content;
      } else if (data.type === 'error') {
        throw new Error(data.content);
      } else if (data.type === 'done') {
        return;
      }
    }
  }
}
