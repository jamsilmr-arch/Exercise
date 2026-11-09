import os
from google import genai

# GitHub Secrets에서 API 키 로드
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY가 설정되지 않았습니다.")

client = genai.Client(api_key=api_key)

prompt = """
운동 웹앱의 app.js 코드 전체를 출력해줘.
1. startWorkout() 실행 시 'view-condition' 화면으로 이동할 것.
2. 오늘 컨디션(1~4점) 및 근육통 부위 선택 바텀시트 제어 로직을 포함할 것.
3. 코드 외 다른 설명 문구는 일절 제외하고 순수 JavaScript 코드만 출력해줘.
"""

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt
)

# 생성된 결과를 app.js 파일에 직접 덮어쓰기
with open("app.js", "w", encoding="utf-8") as f:
    f.write(response.text.strip())

print("app.js 파일 자동 업데이트 완료!")
