// Database of multi-format quiz challenges
const quizDatabase = [
    {
        type: "single",
        question: "Which language runs natively inside a standard web browser architecture?",
        hint: "Select exactly one answer",
        options: ["Python", "Java", "C++", "JavaScript"],
        correct: "JavaScript"
    },
    {
        type: "multi",
        question: "Which of the following elements are valid semantic HTML5 components?",
        hint: "Multi-Select: Choose all correct parameters",
        options: ["<section>", "<div>", "<article>", "<display>"],
        correct: ["<section>", "<article>"]
    },
    {
        type: "blank",
        question: "Complete the sentence: CSS stands for __________ Stylesheets.",
        hint: "Fill in the blank (Case-insensitive verification)",
        correct: "Cascading"
    },
    {
        type: "boolean",
        question: "The 'const' keyword creates an immutable variable bindings that cannot be reassigned.",
        hint: "True or False evaluation",
        options: ["True", "False"],
        correct: "True"
    }
];

// App Core State
let currentQuestionIndex = 0;
let pointsGained = 0;

// Element Nodes Hook
const quizBox = document.getElementById('quizBox');
const resultBox = document.getElementById('resultBox');
const questionText = document.getElementById('questionText');
const questionHint = document.getElementById('questionHint');
const answerOptions = document.getElementById('answerOptions');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const currentScoreTracker = document.getElementById('currentScore');

// Initial Setup
function initializeChallenge() {
    const activeChallenge = quizDatabase[currentQuestionIndex];
    
    // Clear and reset state elements
    answerOptions.innerHTML = '';
    submitBtn.style.display = 'block';
    submitBtn.disabled = false;
    nextBtn.style.display = 'none';

    // Update progress elements
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${quizDatabase.length}`;
    progressFill.style.width = `${((currentQuestionIndex) / quizDatabase.length) * 100}%`;
    currentScoreTracker.textContent = pointsGained;

    questionText.textContent = activeChallenge.question;
    questionHint.textContent = activeChallenge.hint;

    // Factory rendering patterns matching problem profile types
    if (activeChallenge.type === 'single' || activeChallenge.type === 'boolean') {
        const inputType = 'radio';
        activeChallenge.options.forEach(opt => {
            renderSelectRow(opt, inputType);
        });
    } else if (activeChallenge.type === 'multi') {
        const inputType = 'checkbox';
        activeChallenge.options.forEach(opt => {
            renderSelectRow(opt, inputType);
        });
    } else if (activeChallenge.type === 'blank') {
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Type your answer here...';
        inputField.className = 'blank-input';
        inputField.id = 'textBlankInput';
        answerOptions.appendChild(inputField);
    }
}

// Render option row wrapper helper
function renderSelectRow(text, type) {
    const label = document.createElement('label');
    label.className = 'option-label';
    
    const input = document.createElement('input');
    input.type = type;
    input.name = "quizOption";
    input.value = text;

    label.appendChild(input);
    label.appendChild(document.createTextNode(text));
    answerOptions.appendChild(label);
}

// Processing evaluation strategies
function evaluateInput() {
    const activeChallenge = quizDatabase[currentQuestionIndex];
    let userVerdictCorrect = false;

    // Block interactions across form fields upon verification submission
    submitBtn.disabled = true;

    if (activeChallenge.type === 'single' || activeChallenge.type === 'boolean') {
        const chosenRadio = document.querySelector('input[name="quizOption"]:checked');
        if (!chosenRadio) return alert("Please pick an answer selection!");

        const isCorrect = (chosenRadio.value === activeChallenge.correct);
        styleSelectLabels(chosenRadio.value, activeChallenge.correct);
        if (isCorrect) userVerdictCorrect = true;

    } else if (activeChallenge.type === 'multi') {
        const checkedCheckboxes = Array.from(document.querySelectorAll('input[name="quizOption"]:checked')).map(el => el.value);
        if (checkedCheckboxes.length === 0) return alert("Select at least one choice option!");

        // Validate complete symmetric identity array matches matches
        const matchesAll = checkedCheckboxes.every(val => activeChallenge.correct.includes(val)) && 
                           checkedCheckboxes.length === activeChallenge.correct.length;

        // Visual validation mapping
        const allLabels = answerOptions.querySelectorAll('.option-label');
        allLabels.forEach(label => {
            const currentVal = label.querySelector('input').value;
            if (activeChallenge.correct.includes(currentVal)) {
                label.classList.add('correct');
            } else if (checkedCheckboxes.includes(currentVal)) {
                label.classList.add('wrong');
            }
        });

        if (matchesAll) userVerdictCorrect = true;

    } else if (activeChallenge.type === 'blank') {
        const textVal = document.getElementById('textBlankInput').value.trim();
        if (!textVal) return alert("Please enter text string input field!");

        const isMatch = (textVal.toLowerCase() === activeChallenge.correct.toLowerCase());
        const inputElement = document.getElementById('textBlankInput');
        
        if (isMatch) {
            inputElement.style.borderColor = 'var(--accent-correct)';
            userVerdictCorrect = true;
        } else {
            inputElement.style.borderColor = 'var(--accent-wrong)';
            // Show correct answer alongside input
            const disclosure = document.createElement('p');
            disclosure.style.cssText = "color: var(--accent-correct); margin-top: 10px; font-weight:600;";
            disclosure.textContent = `Correct answer was: ${activeChallenge.correct}`;
            answerOptions.appendChild(disclosure);
        }
    }

    // Freeze inputs
    Array.from(answerOptions.querySelectorAll('input')).forEach(inp => inp.disabled = true);

    if (userVerdictCorrect) pointsGained++;
    currentScoreTracker.textContent = pointsGained;

    // Toggle submission footer layout
    submitBtn.style.display = 'none';
    nextBtn.style.display = 'block';
}

// Label styling validation helper
function styleSelectLabels(selectedVal, correctVal) {
    const labels = answerOptions.querySelectorAll('.option-label');
    labels.forEach(label => {
        const val = label.querySelector('input').value;
        if (val === correctVal) {
            label.classList.add('correct');
        } else if (val === selectedVal) {
            label.classList.add('wrong');
        }
    });
}

function advanceTimeline() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizDatabase.length) {
        initializeChallenge();
    } else {
        renderScoreBoard();
    }
}

// Ending Results Interface Builder
function renderScoreBoard() {
    quizBox.style.display = 'none';
    resultBox.style.display = 'block';

    const percentageSummary = Math.round((pointsGained / quizDatabase.length) * 100);
    document.getElementById('finalScore').textContent = percentageSummary;

    const feedbackText = document.getElementById('scoreFeedback');
    if (percentageSummary === 100) {
        feedbackText.textContent = "Perfect score! Brilliant performance!";
    } else if (percentageSummary >= 70) {
        feedbackText.textContent = "Great job! You have a solid grasp on these concepts.";
    } else {
        feedbackText.textContent = "Keep practicing! Review the materials and try again.";
    }
}

function rebootQuizEngine() {
    currentQuestionIndex = 0;
    pointsGained = 0;
    resultBox.style.display = 'none';
    quizBox.style.display = 'block';
    initializeChallenge();
}

// Bind Events
submitBtn.addEventListener('click', evaluateInput);
nextBtn.addEventListener('click', advanceTimeline);
document.getElementById('restartBtn').addEventListener('click', rebootQuizEngine);

// Launch Application instance
initializeChallenge();