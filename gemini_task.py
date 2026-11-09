import os
import re
from google import genai

# 1. GitHub Secrets에서 API 키 로드
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY가 설정되지 않았습니다. GitHub Settings -> Secrets에서 GEMINI_API_KEY를 등록해주세요.")

client = genai.Client(api_key=api_key)

# 2. home.js 자동 수정 (home.html에서 운동 시작 클릭 시 index.html#condition으로 이동)
def update_home_js():
    home_js_content = """// [자동 수정됨] home.html에서 오늘 운동 시작 클릭 시 메인 앱(index.html)의 컨디션 화면으로 이동
window.startTodayWorkout = function() {
    window.location.href = 'index.html#condition';
};

window.startWorkout = function() {
    window.location.href = 'index.html#condition';
};

document.addEventListener("DOMContentLoaded", function () {
    const userStrengthRatio = localStorage.getItem('user_strength_ratio') || 25;
    const activeRoutineId = localStorage.getItem('active_routine_id') || 'rt_5_push_pull';
    const completedDays = parseInt(localStorage.getItem('completed_analysis_days')) || 0;
    
    if (typeof updateBlockProgressCard === 'function') {
        updateBlockProgressCard(completedDays);
    }
});
"""
    with open("home.js", "w", encoding="utf-8") as f:
        f.write(home_js_content)
    print("✅ home.js 파일 업데이트 완료!")

# 3. Gemini API를 호출하여 app.js 자동 생성 및 정제 후 저장
def generate_and_update_app_js():
    prompt = """
    운동 웹앱의 app.js 코드 전체를 출력해줘.
    1. startWorkout() 실행 시 'view-condition' 화면으로 이동할 것.
    2. 오늘 컨디션(1~4점) 및 근육통 부위 선택 바텀시트 제어 로직을 포함할 것.
    3. 코드 외 다른 설명 문구, 인사말, 주석 상단 설명 등은 일절 제외하고 순수 JavaScript 코드만 출력해줘.
    """
    
    print("🤖 Gemini API에 app.js 생성 요청 중...")
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    
    raw_text = response.text.strip()
    
    # 마크다운 코드 펜스(```javascript ... ```) 제거 정제 로직
    cleaned_code = re.sub(r'^```(?:javascript|js)?\n', '', raw_text, flags=re.MULTILINE)
    cleaned_code = re.sub(r'\n```$', '', cleaned_code, flags=re.MULTILINE)

    with open("app.js", "w", encoding="utf-8") as f:
        f.write(cleaned_code.strip())
    print("✅ app.js 파일 Gemini API 동적 업데이트 완료!")

if __name__ == "__main__":
    print("🚀 저장소 파일 자동 수정 시작...")
    update_home_js()
    generate_and_update_app_js()
    print("🎉 모든 작업 완료!")
