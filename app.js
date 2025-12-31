class MathTestApp {
    constructor() {
        // Screen elements
        this.startScreen = document.getElementById('startScreen');
        this.testScreen = document.getElementById('testScreen');
        this.resultsScreen = document.getElementById('resultsScreen');
        this.reviewScreen = document.getElementById('reviewScreen');
        this.logsModal = document.getElementById('logsModal');

        // UI elements
        this.currentDate = document.getElementById('currentDate');
        this.logsBtn = document.getElementById('logsBtn');
        this.startReasoningBtn = document.getElementById('startReasoningBtn');
        this.startBtn = document.getElementById('startBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.retakeBtn = document.getElementById('retakeBtn');
        this.reviewBtn = document.getElementById('reviewBtn');
        this.closeReviewBtn = document.getElementById('closeReviewBtn');
        this.closeLogsBtn = document.getElementById('closeLogsBtn');
        this.downloadLogsBtn = document.getElementById('downloadLogsBtn');
        this.clearLogsBtn = document.getElementById('clearLogsBtn');
        this.answerInput = document.getElementById('answerInput');

        // Test state
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];
        this.logs = [];
        this.testStartTime = null;
        this.questionStartTime = null;
        this.timerInterval = null;
        this.timeLimit = 60;
        this.difficulty = 'medium';
        this.selectedTypes = [];

        this.initEventListeners();
        this.updateDate();
        this.loadLogs();
        // Global error handler to surface runtime errors into logs
        window.addEventListener('error', (ev) => {
            try { this.addLog('ERROR', ev.message || String(ev)); } catch(e) { console.error('Logging error', e); }
        });
    }

    initEventListeners() {
        if (this.startBtn) this.startBtn.addEventListener('click', () => this.startTest());
        if (this.startReasoningBtn) this.startReasoningBtn.addEventListener('click', () => this.startReasoning());
        if (this.submitBtn) this.submitBtn.addEventListener('click', () => this.submitAnswer());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextQuestion());
        if (this.retakeBtn) this.retakeBtn.addEventListener('click', () => this.resetAndStart());
        if (this.reviewBtn) this.reviewBtn.addEventListener('click', () => this.showReview());
        if (this.closeReviewBtn) this.closeReviewBtn.addEventListener('click', () => this.hideReview());
        if (this.logsBtn) this.logsBtn.addEventListener('click', () => this.openLogs());
        if (this.closeLogsBtn) this.closeLogsBtn.addEventListener('click', () => this.closeLogs());
        if (this.downloadLogsBtn) this.downloadLogsBtn.addEventListener('click', () => this.downloadLogs());
        if (this.clearLogsBtn) this.clearLogsBtn.addEventListener('click', () => this.clearLogs());
        if (this.logsModal) this.logsModal.addEventListener('click', (e) => {
            if (e.target === this.logsModal) this.closeLogs();
        });

        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.level;
            });
        });

        // Time selection
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.timeLimit = parseInt(btn.dataset.time);
            });
        });

        // Answer input - submit on Enter
        if (this.answerInput) {
            this.answerInput.addEventListener('keypress', (e) => {
                const feedbackEl = document.getElementById('feedbackArea');
                const feedbackHidden = feedbackEl ? feedbackEl.classList.contains('hidden') : true;
                if (e.key === 'Enter' && !feedbackHidden) {
                    this.nextQuestion();
                } else if (e.key === 'Enter') {
                    this.submitAnswer();
                }
            });
        }
    }

    updateDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);
        this.currentDate.textContent = today;
    }

    startTest() {
        // Force moderate level for series-wise structured test
        this.difficulty = 'medium';
        // reset attempt state so each test is fresh
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];

        // mark attempt so re-attempts produce unique questions
        this.attemptSeed = Date.now();

        // Generate structured questions for today (10 questions)
        // Topics: Percentage, Average, Ratio & Proportion, Partnership, Profit and loss,
        // Unitary method, Time and work, Time and distance, plus 2 extra arithmetic
        this.questions = this.generateQuestions(10);
        this.testStartTime = new Date();
        this.addLog('TEST_START', `Started test with ${this.difficulty} difficulty`, true);
        this.showScreen('testScreen');
        this.loadQuestion();
    }

    startReasoning() {
        this.reasoningMode = true;
        this.difficulty = 'medium';
        // reset attempt state for reasoning
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];

        // unique attempt seed so re-attempts differ
        this.attemptSeed = Date.now();
        this.questions = this.generateReasoningQuestions(30);
        this.testStartTime = new Date();
        this.addLog('TEST_START', `Started reasoning practice (30 Qs)`, true);
        this.showScreen('testScreen');
        this.loadQuestion();
    }

    generateQuestions(count) {
        // AI-based question generation using date-based seed for daily consistency
        const today = new Date().toDateString();
        const seedBase = today + this.difficulty + (this.attemptSeed || '0');
        let seed = this.hashCode(seedBase);
        const questions = [];

        // Define the ordered topics requested by user
        const topics = ['percentage','average','ratio','partnership','profit_loss','unitary','time_work','time_distance'];

        for (let i = 0; i < count; i++) {
            seed = (seed * 9301 + 49297) % 233280;
            let type;

            if (i < topics.length) type = topics[i];
            else if (i === topics.length) type = 'addition';
            else type = 'multiplication';

            const question = this.generateQuestion(type, seed);
            questions.push(question);
        }
        
        return questions;
    }

    generateReasoningQuestions(count) {
        const today = new Date().toDateString();
        const seedBase = today + 'reasoning' + this.difficulty + (this.attemptSeed || '0');
        let seed = this.hashCode(seedBase);
        const questions = [];

        // simple pools for verbal reasoning
        const synonyms = [['happy','joyful'], ['quick','fast'], ['big','large'], ['start','begin']];
        const antonyms = [['hot','cold'], ['up','down'], ['light','heavy'], ['empty','full']];
        const analogies = [['bird','wing','fish','?'], ['hand','glove','foot','?']];

        for (let i = 0; i < count; i++) {
            seed = (seed * 9301 + 49297) % 233280;
            const kind = (i % 2 === 0) ? 'verbal' : 'nonverbal';

            if (kind === 'verbal') {
                const choice = seed % 3;
                if (choice === 0) {
                    const pair = synonyms[seed % synonyms.length];
                    const q = `Find a synonym of '${pair[0]}'`;
                    const a = pair[1];
                    const sol = `Synonym of ${pair[0]} is ${a}`;
                    questions.push({ question: q, answer: String(a), solution: sol, type: 'verbal' });
                } else if (choice === 1) {
                    const pair = antonyms[seed % antonyms.length];
                    const q = `Find an antonym of '${pair[0]}'`;
                    const a = pair[1];
                    const sol = `Antonym of ${pair[0]} is ${a}`;
                    questions.push({ question: q, answer: String(a), solution: sol, type: 'verbal' });
                } else {
                    const pair = analogies[seed % analogies.length];
                    // build a simple analogy A:B :: C:? where ? is related
                    const map = {
                        'bird': 'wing', 'fish': 'fin', 'hand': 'glove', 'foot': 'sock'
                    };
                    const A = pair[0], B = pair[1], C = pair[2];
                    const a = map[C] || 'answer';
                    const q = `${A} : ${B} :: ${C} : ?`;
                    const sol = `${C} is to ${a}`;
                    questions.push({ question: q, answer: String(a), solution: sol, type: 'verbal' });
                }
            } else {
                // nonverbal: simple numeric sequence next number
                const start = (seed % 5) + 2; // 2..6
                const diff = (seed % 4) + 1; // 1..4
                const seq = [];
                for (let k = 0; k < 4; k++) seq.push(start + k * diff);
                const next = start + 4 * diff;
                const q = `Find the next number: ${seq.join(', ')} , ?`;
                const sol = `Pattern adds ${diff}; next = ${next}`;
                questions.push({ question: q, answer: String(next), solution: sol, type: 'nonverbal' });
            }
        }

        return questions;
    }

    generateQuestion(type, seed) {
        // Simple deterministic helper
        const rand = (min, max) => {
            seed = (seed * 9301 + 49297) % 233280;
            return min + (seed % (max - min + 1));
        };

        // Difficulty-based ranges
        let r1Min = 2, r1Max = 20, rSmallMin = 1, rSmallMax = 12, speedMin = 20, speedMax = 60, distMin = 10, distMax = 80;
        if (this.difficulty === 'medium') {
            r1Min = 10; r1Max = 120; rSmallMin = 5; rSmallMax = 40; speedMin = 30; speedMax = 100; distMin = 20; distMax = 200;
        } else if (this.difficulty === 'hard') {
            r1Min = 100; r1Max = 1000; rSmallMin = 20; rSmallMax = 200; speedMin = 40; speedMax = 140; distMin = 50; distMax = 500;
        }

        const r1 = () => rand(r1Min, r1Max);
        const rSmall = () => rand(rSmallMin, rSmallMax);

        let q = '';
        let ans = 0;
        let solution = '';

        if (type === 'percentage') {
            const base = r1() * 5; // a multiple to keep numbers neat
            const pct = rand(5, 30);
            ans = Math.round((base * pct) / 100);
            q = `What is ${pct}% of ${base}?`;
            solution = `${pct}% of ${base} = (${pct}/100) × ${base} = ${ans}`;
        } else if (type === 'average') {
            const n = 3;
            const a = r1();
            const b = r1();
            const c = r1();
            ans = Math.round((a + b + c) / n);
            q = `Find the average of ${a}, ${b} and ${c}.`;
            solution = `Average = (${a} + ${b} + ${c})/${n} = ${ans}`;
        } else if (type === 'ratio') {
            const a = rand(2,10);
            const b = rand(2,10);
            const total = (a + b) * rand(2,5);
            ans = Math.round((a / (a + b)) * total);
            q = `If two numbers are in ratio ${a}:${b} and their total is ${total}, find the first number.`;
            solution = `First = (${a}/(${a}+${b})) × ${total} = ${ans}`;
        } else if (type === 'partnership') {
            const p1 = rand(2,6);
            const p2 = rand(2,6);
            const capital1 = p1 * 100;
            const capital2 = p2 * 100;
            const profit = rand(100,500);
            const share1 = Math.round((capital1 / (capital1 + capital2)) * profit);
            ans = share1;
            q = `A and B invest ${capital1} and ${capital2} respectively. If profit is ${profit}, find A's share.`;
            solution = `A's share = (${capital1}/(${capital1}+${capital2})) × ${profit} = ${ans}`;
        } else if (type === 'profit_loss') {
            const cost = r1() * 10;
            const gain = rand(5,40);
            ans = Math.round((gain / 100) * cost);
            q = `An item costs ${cost}. If it is sold at a profit of ${gain}%, how much profit is made?`;
            solution = `Profit = (${gain}/100) × ${cost} = ${ans}`;
        } else if (type === 'unitary') {
            const unit = rand(2,12);
            const total = unit * rand(2,10);
            ans = Math.round(total / unit);
            q = `If ${total} items cost $${total}, what is the cost of one item? (unitary method)`;
            solution = `Cost per item = ${total}/${unit} = ${ans}`;
        } else if (type === 'time_work') {
            const a = rand(2,8);
            const b = rand(2,8);
            const work = rand(10,30);
            const rateA = 1 / a;
            const rateB = 1 / b;
            const together = Math.round(work / (rateA + rateB));
            ans = together;
            q = `A can do a job in ${a} days and B in ${b} days. How many days together to finish ${work} units (proportional)?`;
            solution = `A's rate = 1/${a}, B's rate = 1/${b}. Together rate = ${ (rateA+rateB).toFixed(3) }. Days ≈ ${ans}`;
        } else if (type === 'time_distance') {
            const speed = rand(speedMin, speedMax);
            const dist = rand(distMin, distMax);
            ans = Math.round((dist / speed) * 60); // minutes
            q = `If a car travels at ${speed} km/h, how many minutes to cover ${dist} km?`;
            solution = `Time (hours) = ${dist}/${speed} = ${(dist/speed).toFixed(2)} h = ${ans} minutes`;
        } else if (type === 'addition') {
            const a = rSmall();
            const b = rSmall();
            ans = a + b;
            q = `Calculate: ${a} + ${b}`;
            solution = `${a} + ${b} = ${ans}`;
        } else { // multiplication
            const a = rand(2,12);
            const b = rand(2,12);
            ans = a * b;
            q = `Calculate: ${a} × ${b}`;
            solution = `${a} × ${b} = ${ans}`;
        }

        return { question: q, answer: ans, type: type, difficulty: this.difficulty, solution };
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    loadQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endTest();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        document.getElementById('questionText').textContent = question.question;
        document.getElementById('difficultyIndicator').textContent = `${question.type.toUpperCase()} • ${this.difficulty.toUpperCase()}`;
        document.getElementById('difficultyDisplay').textContent = this.difficulty.toUpperCase();
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('totalQuestions').textContent = this.questions.length;

        // Update progress
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';

        this.answerInput.value = '';
        this.answerInput.focus();
        document.getElementById('feedbackArea').classList.add('hidden');

        this.questionStartTime = Date.now();
        this.startTimer();
    }

    startTimer() {
        let timeRemaining = this.timeLimit;
        document.getElementById('timerDisplay').textContent = timeRemaining;

        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            timeRemaining--;
            document.getElementById('timerDisplay').textContent = timeRemaining;
            
            const percentage = (timeRemaining / this.timeLimit) * 100;
            const circumference = 282.7;
            const offset = circumference - (percentage / 100) * circumference;
            document.getElementById('timerCircle').style.strokeDashoffset = offset;

            if (timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.submitAnswer(true);
            }
        }, 1000);
    }

    submitAnswer(timeout = false) {
        clearInterval(this.timerInterval);
        
        const userAnswer = this.answerInput.value.trim();
        const question = this.questions[this.currentQuestionIndex];
        const timeSpent = Math.round((Date.now() - this.questionStartTime) / 1000);

        let isCorrect = false;
        if (userAnswer !== '') {
            // numeric answers
            if (typeof question.answer === 'number') {
                const num = parseFloat(userAnswer);
                if (!isNaN(num) && Math.abs(num - question.answer) < 1e-6) {
                    isCorrect = true;
                    this.score++;
                }
            } else {
                // string answers (reasoning) - case-insensitive compare
                if (String(userAnswer).trim().toLowerCase() === String(question.answer).trim().toLowerCase()) {
                    isCorrect = true;
                    this.score++;
                }
            }
        }

        this.answers.push({
            question: question.question,
            userAnswer: userAnswer || '(No answer)',
            correctAnswer: question.answer,
            isCorrect: isCorrect,
            timeSpent: timeSpent,
            type: question.type
        });

        // Log answer
        this.addLog('ANSWER', `Q${this.currentQuestionIndex + 1}: ${question.question} Answer: ${userAnswer} (${isCorrect ? 'Correct' : 'Wrong'})`, false);

        // Show feedback
        const feedbackArea = document.getElementById('feedbackArea');
        const feedbackContent = document.getElementById('feedbackContent');

        feedbackArea.className = 'feedback-area ' + (isCorrect ? 'correct' : 'incorrect');

        let feedbackHTML = `<div class="feedback-status ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}">
            ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
        </div>`;

        if (!isCorrect) {
            feedbackHTML += `<div class="feedback-detail">
                Your answer: <strong>${userAnswer || 'No answer'}</strong><br>
                Correct answer: <strong>${question.answer}</strong>
            </div>`;
        }

        if (timeout) {
            feedbackHTML += `<div class="feedback-detail" style="margin-top: 10px; color: #ff9800;">
                ⏱️ Time limit exceeded
            </div>`;
        }

        feedbackContent.innerHTML = feedbackHTML;
        feedbackArea.classList.remove('hidden');

        this.submitBtn.style.display = 'none';
        this.answerInput.disabled = true;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endTest();
        } else {
            this.answerInput.disabled = false;
            this.submitBtn.style.display = 'block';
            this.loadQuestion();
        }
    }

    endTest() {
        clearInterval(this.timerInterval);
        const testEndTime = new Date();
        const totalTime = Math.round((testEndTime - this.testStartTime) / 1000);
        
        this.addLog('TEST_END', `Completed test with score ${this.score}/${this.questions.length}`, true);
        
        this.showResults(totalTime);
    }

    showResults(totalTime) {
        const accuracy = Math.round((this.score / this.questions.length) * 100);
        const avgTime = Math.round(totalTime / this.questions.length);

        document.getElementById('finalScore').textContent = `${this.score}/${this.questions.length}`;
        document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
        document.getElementById('correctAnswers').textContent = this.score;
        document.getElementById('totalTime').textContent = this.formatTime(totalTime);
        document.getElementById('avgTime').textContent = `${avgTime}s`;
        document.getElementById('difficultyResult').textContent = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);

        // Update score circle
        const circumference = 565.48;
        const offset = circumference - (accuracy / 100) * circumference;
        document.getElementById('scoreCircle').style.strokeDashoffset = offset;

        // Performance message
        let message = '';
        let messageClass = '';
        if (accuracy >= 80) {
            message = '🎉 Excellent work! You\'re mastering arithmetic!';
            messageClass = 'good';
        } else if (accuracy >= 60) {
            message = '👍 Good effort! Keep practicing to improve your skills.';
            messageClass = 'average';
        } else {
            message = '💪 Keep practicing! Every question helps you improve.';
            messageClass = 'poor';
        }

        const perfMsg = document.getElementById('performanceMessage');
        perfMsg.textContent = message;
        perfMsg.className = 'performance-message ' + messageClass;

        // Update header stats
        document.getElementById('scoreDisplay').textContent = `${this.score}/${this.questions.length}`;
        document.getElementById('accuracyDisplay').textContent = `${accuracy}%`;

        this.showScreen('resultsScreen');
    }

    showReview() {
        const reviewContent = document.getElementById('reviewContent');
        reviewContent.innerHTML = '';

        this.answers.forEach((answer, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${answer.isCorrect ? 'correct' : 'incorrect'}`;

            // Include solution explanation if available from generated question
            const sol = (this.questions[index] && this.questions[index].solution) ? this.questions[index].solution : '';

            reviewItem.innerHTML = `
                <div class="review-number">Question ${index + 1}</div>
                <div class="review-question">${answer.question}</div>
                <div class="review-answers">
                    <div class="review-answer correct-answer">
                        <div class="review-answer-label">Correct Answer:</div>
                        <div class="review-answer-value">${answer.correctAnswer}</div>
                    </div>
                    <div class="review-answer user-answer">
                        <div class="review-answer-label">Your Answer:</div>
                        <div class="review-answer-value">${answer.userAnswer}</div>
                    </div>
                </div>
                <div style="margin-top:12px; background:#fff; padding:10px; border-radius:6px; font-size:13px; color:#333;">
                    <strong>Solution:</strong> ${sol}
                </div>
            `;

            reviewContent.appendChild(reviewItem);
        });

        this.showScreen('reviewScreen');
    }

    hideReview() {
        this.showScreen('resultsScreen');
    }

    resetAndStart() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];
        this.questions = [];
        this.showScreen('startScreen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }

    addLog(type, message, isTimestamp = false) {
        const now = new Date();
        const logEntry = {
            timestamp: now.toLocaleTimeString(),
            type: type,
            message: message,
            fullTime: now.toISOString()
        };

        this.logs.push(logEntry);
        this.saveLogs();
    }

    openLogs() {
        const logsContent = document.getElementById('logsContent');
        logsContent.innerHTML = '';

        if (this.logs.length === 0) {
            logsContent.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No logs yet</p>';
        } else {
            this.logs.forEach(log => {
                const logDiv = document.createElement('div');
                logDiv.className = 'log-entry';
                logDiv.innerHTML = `
                    <span class="log-timestamp">${log.timestamp}</span>
                    <span class="log-type">[${log.type}]</span>
                    <span class="log-message">${log.message}</span>
                `;
                logsContent.appendChild(logDiv);
            });
        }

        this.logsModal.classList.remove('hidden');
    }

    closeLogs() {
        this.logsModal.classList.add('hidden');
    }

    downloadLogs() {
        const logText = this.logs.map(log => 
            `[${log.timestamp}] ${log.type}: ${log.message}`
        ).join('\n');

        const blob = new Blob([logText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `math-test-logs-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.addLog('SYSTEM', 'Logs downloaded', false);
    }

    clearLogs() {
        if (confirm('Are you sure you want to clear all logs?')) {
            this.logs = [];
            this.saveLogs();
            this.openLogs();
            this.addLog('SYSTEM', 'All logs cleared', false);
        }
    }

    saveLogs() {
        localStorage.setItem('mathTestLogs', JSON.stringify(this.logs));
    }

    loadLogs() {
        const saved = localStorage.getItem('mathTestLogs');
        if (saved) {
            this.logs = JSON.parse(saved);
        }
    }

    // Automated test runner: programmatically answer each question correctly and advance
    async autoRunTest() {
        // small delay to allow UI to settle
        const wait = (ms) => new Promise(res => setTimeout(res, ms));

        // Start test
        this.startTest();
        await wait(500);

        for (let i = 0; i < this.questions.length; i++) {
            const q = this.questions[this.currentQuestionIndex];
            // fill correct answer
            this.answerInput.value = q.answer;
            // submit
            this.submitAnswer();
            // wait to show feedback
            await wait(600);
            // move to next
            this.nextQuestion();
            await wait(400);
        }

        // Wait for results to render
        await wait(800);
        // Open logs
        this.openLogs();
        this.addLog('AUTOTEST', 'Autotest completed', false);
    }
}

// Initialize the app when the DOM is ready
// Instantiate app immediately (script is at end of body so DOM elements are present)
try {
    const app = new MathTestApp();
    window.mathApp = app;

    // If URL contains ?autotest=1, run a full automated test (answers submitted correctly)
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('autotest') === '1') {
            if (typeof app.autoRunTest === 'function') app.autoRunTest();
        }
    } catch (e) {}
} catch (e) {
    // If initialization fails, log to console
    console.error('Failed to initialize MathTestApp:', e);
}

