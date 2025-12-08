// --- 模擬考試數據 (ExamData) ---
const ExamData = [
    {
        id: 1,
        audio_url: 'audio/C01-1.mp3',
    },
    {
        id: 1,
        number: 1,
        type: 'single',
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
        number: 2,
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
        number: 3,
        type: 'multiple',
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
let userAnswers = {}; 
const totalQuestions = 6;
let timeLeft = 1 * 60; // 30分鐘 (秒)
let timerInterval;

// --- DOM 元素選擇器 ---
const welcomePage = document.getElementById('welcome-page');
const testInterface = document.getElementById('test-interface');
const startButton = document.getElementById('start-button');

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

/** 1. 格式化並啟動計時器 */
function startTimer(go) {
    totalQuestionsDisplay.textContent = totalQuestions;
    
    // 檢查是否已經有計時器在運行
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("考試時間到！系統將自動交卷。");
            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerElement.textContent = 
            `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (go){
            timeLeft--;
        }
    }, 1000);
}

/** 2. 處理音頻播放進度和結束 */
function setupAudioPlayer() {
    // 監聽音頻播放時間更新事件 (用於更新進度條)
    audioPlayer.ontimeupdate = function() {
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${percentage}%`;
    };

    audioPlayer.onended = function() {
        // 音檔結束後，顯示問題區塊
        questionSection.style.display = 'block';
        audioSection.style.display = 'none';
        nextButton.disabled = false; // 啟用 Next 按鈕
    };
}

/** 3. 處理開始按鈕點擊事件，啟動考試流程 */
function startTest() {
    
    // 介面切換：隱藏歡迎頁，顯示考試介面
    welcomePage.style.display = 'none';
    testInterface.style.display = 'block'; // 使用 flex 確保樣式正常

    // 啟動計時器
    startTimer(0);
    
    // 載入並播放第一道題目 (應順利播放，因為使用者已互動)
    loadQuestion(0);
}


/** 4. 載入並顯示當前題目 */
function loadQuestion(index) {
    
    const question = ExamData[index];
    currentQuestionIndex = index;
    
    
    // A. 處理音頻
    if (index % 10 == 0){
        audioPlayer.src = question.audio_url;
        audioPlayer.load();
        
        // 顯示音頻區塊
        audioSection.style.display = 'block';
        questionSection.style.display = 'none';
        nextButton.disabled = true; // 播放時禁用 Next
        
        // 嘗試播放音檔。因為這是使用者點擊後觸發，成功率會很高。
        audioPlayer.play().catch(e => {
            console.error("Audio playback error:", e);
            alert("音檔無法播放。請確認音檔路徑或重新載入頁面。");
        });

        audioPlayer.onended = function() {
            // 音檔結束後，進入題目
            loadQuestion(currentQuestionIndex + 1);
        };
    } else {
        // B. 載入問題文本
        currentQuestionDisplay.textContent = question.number;
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
            input.name = `answer-${question.id}`; // 每個問題使用不同的 name
            input.value = optionLetter;
    
            const label = document.createElement('label');
            label.htmlFor = `option${optionLetter}`;
            label.textContent = optionText;
    
            // 檢查是否有儲存的答案，並設定為 checked
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
}


/** 5. 處理 Next 按鈕點擊事件 */
function handleNextQuestion() {
    const currentQuestion = ExamData[currentQuestionIndex];
    let selectedAnswer = [];

    // 獲取當前問題選中的答案
    const selector = `input[name="answer-${currentQuestion.id}"]:checked`;
    const selectedInputs = document.querySelectorAll(selector);
    selectedInputs.forEach(input => selectedAnswer.push(input.value));

    // --- 驗證答案是否選中 ---
    if (selectedAnswer.length === 0) {
        errorMessage.textContent = currentQuestion.type === 'multiple' 
            ? "請至少選擇一或多個答案。" 
            : "請選擇一個答案才能進入下一題。";
        errorMessage.style.display = 'block';
        return;
    }
    
    errorMessage.style.display = 'none';

    // --- 儲存答案 ---
    if (currentQuestion.type === 'single') {
        userAnswers[currentQuestion.id] = selectedAnswer[0]; 
    } else {
        userAnswers[currentQuestion.id] = selectedAnswer.sort();
    }
    
    // --- 切換到下一題或結束 ---
    if (currentQuestionIndex < totalQuestions - 1) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        // 已經是最後一題
        alert("測驗完成！系統將自動交卷，請查看結果。");
        clearInterval(timerInterval);
        // 在這裡加入跳轉到結果頁面的程式碼
    }
}


// --- 應用程式初始化 ---
function initializeTest() {
    
    // 設置歡迎頁面的按鈕監聽器
    startButton.addEventListener('click', startTest); 

    // 設置音頻播放器的進度與結束邏輯
    setupAudioPlayer();
    
    // 初始狀態：顯示歡迎頁面，隱藏考試介面
    welcomePage.style.display = 'block';
    testInterface.style.display = 'none';
    
    // 設置 Next 按鈕的監聽器
    nextButton.addEventListener('click', handleNextQuestion);

    // 初始化總題數顯示
    totalQuestionsDisplay.textContent = totalQuestions;
}

// 頁面載入完成後執行初始化
document.addEventListener('DOMContentLoaded', initializeTest);
