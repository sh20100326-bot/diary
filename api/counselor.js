// Vercel Serverless Function: API 키 보안을 위해 서버 측에서 API를 호출합니다.
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { content } = req.body;
    
    // Vercel 환경 변수(Settings > Environment Variables)에서 키를 가져옵니다.
    const API_KEY = process.env.GEMINI_API_KEY; 
    
    if (!API_KEY) {
        return res.status(500).json({ error: 'API Key is not configured in Vercel settings.' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    try {
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
        res.status(200).json(data);
    } catch (error) {
        console.error("Server API Error:", error);
        res.status(500).json({ error: 'AI 상담 엔진 호출 중 오류가 발생했습니다.' });
    }
}
