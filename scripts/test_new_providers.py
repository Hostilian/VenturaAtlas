import urllib.request
import json
import os
import ssl

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, '.env')
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

ctx = ssl._create_unverified_context()

def test_cerebras():
    key = os.environ.get('CEREBRAS_API_KEY')
    if not key:
        print("[CEREBRAS] No API key")
        return
    try:
        url = 'https://api.cerebras.ai/v1/chat/completions'
        body = {'model': 'llama3.1-8b', 'messages': [{'role': 'user', 'content': 'Hello!'}]}
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {key}'})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            res = json.loads(r.read())
            print("[CEREBRAS OK]", res['choices'][0]['message']['content'][:60])
    except Exception as e:
        print("[CEREBRAS FAIL]", e)

def test_nvidia():
    key = os.environ.get('NVIDIA_NIM_API_KEY')
    if not key:
        print("[NVIDIA] No API key")
        return
    try:
        url = 'https://integrate.api.nvidia.com/v1/chat/completions'
        body = {'model': 'meta/llama-3.1-8b-instruct', 'messages': [{'role': 'user', 'content': 'Hello!'}]}
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {key}'})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            res = json.loads(r.read())
            print("[NVIDIA OK]", res['choices'][0]['message']['content'][:60])
    except Exception as e:
        print("[NVIDIA FAIL]", e)

def test_deepseek():
    key = os.environ.get('DEEPSEEK_API_KEY')
    if not key:
        print("[DEEPSEEK] No API key")
        return
    try:
        url = 'https://api.deepseek.com/v1/chat/completions'
        body = {'model': 'deepseek-chat', 'messages': [{'role': 'user', 'content': 'Hello!'}]}
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {key}'})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            res = json.loads(r.read())
            print("[DEEPSEEK OK]", res['choices'][0]['message']['content'][:60])
    except Exception as e:
        print("[DEEPSEEK FAIL]", e)

def test_cohere():
    key = os.environ.get('COHERE_API_KEY')
    if not key:
        print("[COHERE] No API key")
        return
    try:
        url = 'https://api.cohere.com/v1/chat'
        body = {'message': 'Hello!'}
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {key}'})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            res = json.loads(r.read())
            print("[COHERE OK]", res.get('text', '')[:60])
    except Exception as e:
        print("[COHERE FAIL]", e)

def test_openrouter_direct():
    key = os.environ.get('OPENROUTER_API_KEY')
    if not key:
        print("[OPENROUTER] No API key")
        return
    try:
        url = 'https://openrouter.ai/api/v1/chat/completions'
        body = {'model': 'meta-llama/llama-3.1-8b-instruct:free', 'messages': [{'role': 'user', 'content': 'Hello!'}]}
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {key}'})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            res = json.loads(r.read())
            print("[OPENROUTER OK]", res['choices'][0]['message']['content'][:60])
    except Exception as e:
        print("[OPENROUTER FAIL]", e)

if __name__ == '__main__':
    test_cerebras()
    test_nvidia()
    test_deepseek()
    test_cohere()
    test_openrouter_direct()
