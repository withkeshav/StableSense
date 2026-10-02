#!/usr/bin/env python3
"""Persist the exact OmniSearch reader response, including truncation limits.

Used when direct full-byte capture is unavailable. This preserves reader
output, not origin bytes; it makes no claim that a cached reader is live.
"""
import argparse
import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def capture(url, stem):
    directory = Path(__file__).resolve().parent
    target = directory / (stem + '.json')
    response_path = directory / (stem + '-reader-response.json')
    if target.exists() or response_path.exists():
        raise FileExistsError(stem)
    server = Path('/mnt/ai-data/projects/omnisearch/dist/index.js')
    if not server.exists():
        raise FileNotFoundError(server)
    params = StdioServerParameters(command='node', args=[str(server), 'mcp', '--stdio'], env=dict(os.environ))
    captured = datetime.now(timezone.utc).isoformat()
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool('omnisearch_fetch_url', {'url': url})
            texts = [getattr(part, 'text') for part in result.content if getattr(part, 'text', None)]
    payload = json.loads(texts[0])
    response_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + '\n')
    record = {'url': url, 'capturedAt': captured,
              'retrieval_route': 'OmniSearch stdio MCP; exact response retained',
              'reader_response': response_path.name,
              'capture_limit': 'Reader excerpt may be token-compressed or truncated; no origin bytes obtained; cache freshness not established.',
              'markdown': '\n\n'.join(item.get('excerpt', '') for item in payload.get('results', [])),
              'reader_trace': payload.get('fallback_trace', [])}
    target.write_text(json.dumps(record, indent=2, ensure_ascii=True) + '\n')
    print(json.dumps({'capture': str(target), 'success': payload.get('success'),
                      'trace': record['reader_trace'], 'text_chars': len(record['markdown'])}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('url')
    parser.add_argument('stem')
    args = parser.parse_args()
    asyncio.run(capture(args.url, args.stem))
