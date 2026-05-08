/**
 * 고등학생 감정일기 앱 - 보안 강화 버전 (Vercel Serverless Function 연동)
 */

document.addEventListener('DOMContentLoaded', () => {
    const diaryInput = document.getElementById('diary-input');
    const voiceBtn = document.getElementById('voice-input-btn');
    const aiBtn = document.getElementById('ai-counselor-btn');
    const responseArea = document.getElementById('ai-response-area');
    const responseText = document.getElementById('ai-response-text');
    const recordingStatus = document.getElementById('recording-status');

    // [변경됨] 이제 클라이언트 사이드에서는 API 키를 사용하지 않습니다.
    // 모든 요청은 /api/counselor 라는 서버 측 경로로 전달됩니다.

    const savedDiary = localStorage.getItem('today_diary');
    if (savedDiary) diaryInput.value = savedDiary;

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

    voiceBtn.addEventListener('click', () => {
        if (!recognition) return alert('음성 인식을 지원하지 않는 브라우저입니다.');
        recognition.start();
    });

    diaryInput.addEventListener('input', saveToLocal);

    aiBtn.addEventListener('click', async () => {
        const content = diaryInput.value.trim();
        if (!content) return alert('오늘의 일기를 적어주세요! 😊');

        responseArea.classList.remove('hidden');
        responseText.innerText = "상담사 선생님이 일기를 분석 중입니다... ✨";
        responseArea.scrollIntoView({ behavior: 'smooth' });

        try {
            // [변경됨] 직접 Gemini로 가지 않고, 우리가 만든 Vercel 서버 API로 요청을 보냅니다.
            const response = await fetch('/api/counselor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]) {
                const aiMessage = data.candidates[0].content.parts[0].text;
                displayTypingEffect(aiMessage);
            } else {
                throw new Error("상담사님의 응답을 가져오지 못했습니다.");
            }

        } catch (error) {
            console.error("상담 오류:", error);
            responseText.innerText = "서버 설정(환경 변수)을 확인해 주시거나, 잠시 후 다시 시도해 주세요! 😢";
        }
    });

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
