import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import settings
import boto3
import json

def test():
    client = boto3.client(
        "bedrock-runtime",
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region
    )

    try:
        response = client.converse(
            modelId="amazon.nova-micro-v1:0",
            messages=[{"role": "user", "content": [{"text": "Say hello in one sentence."}]}],
            system=[{"text": "You are a helpful assistant. Respond with valid JSON only: {\"message\": \"your response\"}"}],
            inferenceConfig={
                "temperature": 0.3,
                "maxTokens": 256
            }
        )
        content = response['output']['message']['content'][0]['text']
        print("SUCCESS!")
        print("Response:", content)
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")

if __name__ == "__main__":
    test()
