#!/usr/bin/env python3
"""Capture named missing sources after OmniSearch discovery/reading.

Preserves HTTP bytes, final URL, time, and a deterministic text extraction.
Existing captures are never overwritten. No model-generated extraction.
"""
import argparse
import hashlib
import json
import subprocess
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path


class PageText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hidden = []
        self.parts = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.hidden.append(tag)
        if not self.hidden:
            self.parts.append('\n' if tag in ('p', 'div', 'li', 'h1', 'h2', 'h3', 'tr', 'br') else ' ')
            if tag == 'a':
                self.links.extend(value for name, value in attrs if name == 'href' and value)

    def handle_endtag(self, tag):
        if self.hidden and tag == self.hidden[-1]:
            self.hidden.pop()
        if not self.hidden:
            self.parts.append(' ')

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)


def capture(url, stem):
    directory = Path(__file__).resolve().parent
    meta_path = directory / (stem + '.json')
    if meta_path.exists():
        raise FileExistsError(meta_path)
    request = urllib.request.Request(url, headers={'User-Agent': 'StableSense research source verification (public documents)'})
    started = datetime.now(timezone.utc).isoformat()
    with urllib.request.urlopen(request, timeout=90) as response:
        payload = response.read()
        final_url = response.geturl()
        status = response.status
        content_type = response.headers.get('Content-Type', '')
        charset = response.headers.get_content_charset() or 'utf-8'
    is_pdf = payload.startswith(b'%PDF-')
    raw_path = directory / (stem + ('.pdf' if is_pdf else '.html'))
    if raw_path.exists():
        raise FileExistsError(raw_path)
    raw_path.write_bytes(payload)
    links = []
    if is_pdf:
        txt_path = directory / (raw_path.name + '.txt')
        subprocess.run(['pdftotext', '-layout', str(raw_path), str(txt_path)], check=True)
        text = txt_path.read_text()
        method = 'pdftotext -layout'
    else:
        parser = PageText()
        parser.feed(payload.decode(charset, errors='replace'))
        text = '\n'.join(' '.join(line.split()) for line in ''.join(parser.parts).splitlines() if line.strip())
        links = parser.links
        method = 'stdlib HTMLParser; script/style bodies excluded; whitespace collapsed per line'
    record = {'url': url, 'final_url': final_url, 'http_status': status,
              'capturedAt': started, 'content_type': content_type,
              'raw_file': raw_path.name, 'raw_sha256': hashlib.sha256(payload).hexdigest(),
              'extraction_method': method, 'markdown': text, 'links': links,
              'retrieval_route': 'Direct full-byte capture after OmniSearch reader; no model extraction'}
    meta_path.write_text(json.dumps(record, indent=2, ensure_ascii=True) + '\n')
    print(json.dumps({'capture': str(meta_path), 'raw': str(raw_path), 'status': status,
                      'final_url': final_url, 'bytes': len(payload), 'text_chars': len(text)}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('url')
    parser.add_argument('stem')
    args = parser.parse_args()
    capture(args.url, args.stem)
