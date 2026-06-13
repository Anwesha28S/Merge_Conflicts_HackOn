import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from services.llm_service import get_chat_response
import traceback

def test():
    try:
        history = [
            {"role": "assistant", "content": "Hello Pratham! 👋 I'm QuickBot, your quick commerce shopping buddy. What are we shopping for today?"}
        ]
        res = get_chat_response("Movie night snacks under ₹300", history)
        print("Success:", res)
    except Exception as e:
        traceback.print_exc()

if __name__ == "__main__":
    test()
