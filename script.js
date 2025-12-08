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

// --- 應用程式狀態管理 ---
let currentQuestionIndex = 0;
let userAnswers = {}; // 儲存使用者答案：{1: 'D', 2: 'C', ...}
const totalQuestions = ExamData.length;
let timeLeft = 30 * 60; // 總時間：30分鐘 (秒)
let timerInterval;

// --- DOM 元素選擇器 ---
const timerElement = document.getElementById('timer');
const currentQuestionDisplay = document.getElementById('current-question');
const totalQuestionsDisplay = document.getElementById('total-questions');
const audioSection = document.getElementById('audio-section');
const questionSection = document.getElementById('question-section');
const questionTextElement = document.getElementById('question-text');
const optionsArea = document.getElementById('options-area');
const nextButton = document.getElementById('next-button');
const audioPlayer = document.getElementById('audioPlayer');
const progressBar = document.getElementById('progressBar');
const errorMessage = document.getElementById('error-message');


// --- 核心功能函式 ---

/**
 * 1. 格式化並啟動計時器
 */
function startTimer() {
    totalQuestionsDisplay.textContent = totalQuestions; // 初始化總題數

    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("考試時間到！系統將自動交卷。");
            // submitTest(); // 實際應用中會呼叫交卷函式
            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        // 格式化顯示 (例如：05:30)
        timerElement.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        timeLeft--;
    }, 1000);
}

/**
 * 2. 處理音頻播放進度和結束
 */
function setupAudioPlayer() {
    // 禁用 Next 按鈕，直到音檔結束
    nextButton.disabled = true;

    // 監聽音頻播放時間更新事件 (用於更新進度條)
    audioPlayer.ontimeupdate = function() {
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${percentage}%`;
    };

    // 監聽音頻播放結束事件
    audioPlayer.onended = function() {
        // 顯示問題區塊
        questionSection.style.display = 'block';
        
        // 隱藏音頻區塊，模擬轉場
        audioSection.style.display = 'none';

        // 啟用 Next 按鈕，讓使用者可以提交答案
        nextButton.disabled = false;
        
        // 重置進度條 (可選)
        progressBar.style.width = '100%'; 
    };
}


/**
 * 3. 載入並顯示當前題目
 */
function loadQuestion(index) {
    const question = ExamData[index];
    currentQuestionIndex = index;
    currentQuestionDisplay.textContent = index + 1;

    // A. 處理音頻
    if (question.audio_url && question.audio_url !== audioPlayer.src) {
        // 只有當音檔 URL 改變時才重新設定並播放
        audioPlayer.src = question.audio_url;
        audioSection.style.display = 'block';
        questionSection.style.display = 'none';
        nextButton.disabled = true; // 播放時禁用 Next
        
        audioPlayer.load(); // 載入音頻
        audioPlayer.play().catch(e => console.error("Audio playback failed:", e));
    } else {
        // 相同音檔下的連續問題，直接顯示問題區
        audioSection.style.display = 'none';
        questionSection.style.display = 'block';
        nextButton.disabled = false;
    }

    // B. 載入問題文本
    questionTextElement.textContent = question.question_text;
    document.getElementById('q-number-display').textContent = index + 1;
    optionsArea.innerHTML = ''; // 清空舊選項

    // C. 動態生成選項 (單選或多選)
    const inputType = question.type === 'multiple' ? 'checkbox' : 'radio';
    
    question.options.forEach((optionText, i) => {
        const optionLetter = String.fromCharCode(65 + i); // A, B, C, D...
        
        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';
        
        const input = document.createElement('input');
        input.type = inputType;
        input.id = `option${optionLetter}`;
        input.name = 'answer'; // 確保 radio button 只能單選
        input.value = optionLetter;
        
        const label = document.createElement('label');
        label.htmlFor = `option${optionLetter}`;
        label.textContent = optionText;

        // 檢查是否有儲存的答案，如果有則設定為 selected/checked
        const savedAnswer = userAnswers[question.id];
        if (savedAnswer) {
            if (inputType === 'radio' && savedAnswer === optionLetter) {
                input.checked = true;
            } else if (inputType === 'checkbox' && savedAnswer.includes(optionLetter)) {
                input.checked = true;
            }
        }
        
        optionItem.append(input, label);
        optionsArea.appendChild(optionItem);
        
        // 點擊整個選項區塊也能選中 input
        optionItem.onclick = () => input.click();
    });
}


/**
 * 4. 處理 Next 按鈕點擊事件 (儲存答案並進入下一題)
 */
function handleNextQuestion() {
    const currentQuestion = ExamData[currentQuestionIndex];
    let selectedAnswer = [];

    // 獲取所有選中的答案
    const selectedInputs = document.querySelectorAll('input[name="answer"]:checked');
    selectedInputs.forEach(input => selectedAnswer.push(input.value));

    // --- 驗證答案是否選中 ---
    if (selectedAnswer.length === 0) {
        errorMessage.textContent = currentQuestion.type === 'multiple' 
            ? "請至少選擇一或多個答案。" 
            : "請選擇一個答案才能進入下一題。";
        errorMessage.style.display = 'block';
        return;
    }
    
    // 清除錯誤訊息
    errorMessage.style.display = 'none';

    // --- 儲存答案 ---
    if (currentQuestion.type === 'radio') {
        userAnswers[currentQuestion.id] = selectedAnswer[0]; // 單選只存第一個
    } else {
        userAnswers[currentQuestion.id] = selectedAnswer.sort(); // 多選儲存陣列，並排序方便未來比對
    }
    
    // --- 切換到下一題或結束 ---
    if (currentQuestionIndex < totalQuestions - 1) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        // 已經是最後一題
        alert("測驗完成！請點擊確認交卷。");
        // submitTest(); 
        // 實際應用中，會導航到結果頁面或執行交卷函式
    }
}


// --- 應用程式初始化 ---
function initializeTest() {
    // 設置事件監聽器
    nextButton.addEventListener('click', handleNextQuestion);
    
    // 1. 啟動計時器
    startTimer();
    
    // 2. 設置音頻播放器邏輯
    setupAudioPlayer();
    
    // 3. 載入第一道題目
    loadQuestion(0);
}

// 頁面載入完成後執行初始化
document.addEventListener('DOMContentLoaded', initializeTest);
