// data.js 的模擬內容 - 實際應用中這會從外部 JSON 載入
const ExamData = [
    {
        id: 1,
        audio_url: 'audio/lecture1.mp3', // 確保音檔路徑正確
        type: 'single', // 題目類型：單選 (single) 或 多選 (multiple)
        question_text: "根據講座內容，為何教授特別提到木星的『大紅斑』？",
        options: [
            "A. 證明它是太陽系中最古老的風暴。",
            "B. 說明氣候變化如何影響行星。",
            "C. 藉此解釋木星大氣層的化學成分。",
            "D. 用作研究持久性氣候系統的範例。"
        ],
        correct_answer: "D"
    },
    {
        id: 2,
        audio_url: '', // 同一個聽力段落，音檔留空
        type: 'single',
        question_text: "學生提出的問題，最可能引導教授討論哪個話題？",
        options: [
            "A. 衛星對木星磁場的影響。",
            "B. 土星環與木星環的區別。",
            "C. 太空探測器觀察到的新發現。",
            "D. 木星上是否存在生命的可能性。"
        ],
        correct_answer: "C"
    },
    {
        id: 3,
        audio_url: '',
        type: 'multiple', // 模擬一個多選題
        question_text: "下列哪兩項因素，有助於維持大紅斑的巨大規模？ (選擇兩項)",
        options: [
            "A. 木星的快速自轉。",
            "B. 缺乏固體行星表面。",
            "C. 受到周圍衛星的引力拉扯。",
            "D. 內部熱能不斷產生。"
        ],
        correct_answers: ["A", "B"]
    }
];

