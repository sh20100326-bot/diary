/**
 * 고등학생 감정일기 앱 - Gemini AI 연동 버전
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 요소 선택
    const diaryInput = document.getElementById('diary-input');
    const voiceBtn = document.getElementById('voice-input-btn');
    const aiBtn = document.getElementById('ai-counselor-btn');
    const responseArea = document.getElementById('ai-response-area');
    const responseText = document.getElementById('ai-response-text');
    const recordingStatus = document.getElementById('recording-status');

    // 2. API 설정 (사용자 제공 키)
    const API_KEY = "AIzaSyA5J22iN6tlA_31qvQPsv0bqh3XBiXvj-Q";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // 3. 초기 데이터 불러오기
    const savedDiary = localStorage.getItem('today_diary');
    if (savedDiary) diaryInput.value = savedDiary;

    // 4. 음성 인식 설정
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.onstart = () => {
            recordingStatus.classList.remove('hidden');
            voiceBtn.classList.add('recording');
        };
        recognition.onend = () => {
            recordingStatus.classList.add('hidden');
            voiceBtn.classList.remove('recording');
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            diaryInput.value += (diaryInput.value ? ' ' : '') + transcript;
            saveToLocal();
        };
    }

    // 5. 이벤트 리스너
    voiceBtn.addEventListener('click', () => {
        if (!recognition) return alert('음성 인식을 지원하지 않는 브라우저입니다.');
        recognition.start();
    });

    diaryInput.addEventListener('input', saveToLocal);

    aiBtn.addEventListener('click', async () => {
        const content = diaryInput.value.trim();
        if (!content) return alert('오늘의 일기를 적어주세요! 😊');

        // 로딩 표시
        responseArea.classList.remove('hidden');
        responseText.innerText = "고등학생 전문 상담사님이 일기를 읽고 계세요... ✨";
        responseArea.scrollIntoView({ behavior: 'smooth' });

        try {
            // Gemini API 호출
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `당신은 고등학생 전문 상담사입니다. 다음 일기를 읽고 [감정 단어 한 개]를 먼저 말한 뒤, 공감과 따뜻한 위로가 담긴 메시지를 2~3문장으로 작성해주세요.\n\n학생의 일기: "${content}"`
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]) {
                const aiMessage = data.candidates[0].content.parts[0].text;
                displayTypingEffect(aiMessage);
            } else {
                throw new Error("응답 데이터가 없습니다.");
            }

        } catch (error) {
            console.error("AI 상담 오류:", error);
            responseText.innerText = "잠시 상담 선생님과 연결이 어려워요. API 키를 확인하거나 잠시 후 다시 시도해 주세요! 😢";
        }
    });

    // 6. 지원 함수
    function saveToLocal() {
        localStorage.setItem('today_diary', diaryInput.value);
    }

    function displayTypingEffect(text) {
        responseText.innerText = "";
        let i = 0;
        const speed = 35;
        function type() {
            if (i < text.length) {
                responseText.innerText += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                responseArea.scrollIntoView({ behavior: 'smooth' });
            }
        }
        type();
    }
});
