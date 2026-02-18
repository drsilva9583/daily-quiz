/* jshint esversion: 8 */
//category element
const categoryElement = document.getElementById("category");
const dateElement = document.getElementById("date");

//score and progress elements
const scoreContainer = document.querySelector(".score-container");
const scoreElement = document.getElementById("score");
const progressRingElement = document.getElementById("progress-ring");
const progressRingBackground = document.getElementById("progress-ring-background");

//progress ring elements
const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;


//quiz elements
const quizContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const choicesElement = document.getElementById("choices");
const feedbackElement = document.getElementById("feedback");

//control buttons
const startButton = document.getElementById("start-button");
const nextButton = document.getElementById("next-button");
const stopButton = document.getElementById("stop-button");
const answerButton = document.getElementById("answer-button");

const SUBJECT_MAP = [
    "Geography",
    "Science",
    "Math",
    "US History",
    "Literature",
    "CS Fundamentals",
    "Pop Culture"
];

let totalScore = 0;
let questionCount = 0;
let correctCount = 0;
let questionList = [];
let startIndex = -1;
let currentQuestionIndex = -1;

// determine category based on current day of week
const dayOfWeek = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
function getCategory() {
    return SUBJECT_MAP[dayOfWeek];
}

// finds the subject key in the data object that matches the given subject name
function findSubjectKey(data, subjectName) {
    if (!data || !subjectName) return null;
    const keys = Object.keys(data);
    const target = subjectName.toLowerCase();
    return keys.find(key => key.toLowerCase() === target) || null;
}

async function loadQuestion(subjectName) {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // validate JSON structure before proceeding
        const data = await response.json();
        const categoryKey = subjectName || getCategory();
        const subjectKey = findSubjectKey(data, categoryKey);
        if (!subjectKey) throw new Error('Category not found in data: ' + categoryKey);
        
        // load questions for the category
        questionList = data[subjectKey];

        // pick a random first question from the category
        startIndex = Math.floor(Math.random() * questionList.length);
        currentQuestionIndex = startIndex;

        //render question and choices
        renderQuestionAt(currentQuestionIndex);
        await animateIn();

    } catch (error) {
        console.error('Failed to load question:', error);
        questionElement.textContent = 'Error loading question. Open console for details.';
        return null;
    }
}

// renders the question and choices for the given index, with fade-in animation
function renderQuestionAt(index) {
    if (!questionList || questionList.length === 0) {
        questionElement.textContent = 'No questions available for this category.';
        return;
    }
    const q = questionList[index];

    //animation for question change
    quizContainer.classList.remove('fade-out');
    quizContainer.classList.add('fade-in');
    quizContainer.addEventListener('animationend', () => {
        quizContainer.classList.remove('fade-in');
    }, { once: true });

    questionElement.textContent = q.question || 'Question text not available.';
    // render choices or input based on questionType
    choicesElement.innerHTML = '';
    if (q.questionType === 1) {
        //multiple choice
        q.choices.forEach((choice, index) => {
            const id = `choice-${index}`;
            const label = document.createElement('label');
            label.setAttribute('for', id);
            label.className = 'choice-label';
            label.innerHTML = `<input type="radio" name="choices" id="${id}" value="${choice}">${choice}`;
            choicesElement.appendChild(label);
        });
    } else if (q.questionType === 2) {
        // open-ended
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'open-answer';
        input.placeholder = 'Type your answer here...';
        choicesElement.appendChild(input);
    }
}

//progress ring logic
function setProgress(percent) {
  const p = Math.max(0, Math.min(100, percent || 0));
  const offset = circumference - (p / 100) * circumference;
  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = offset;
}

// handle answer submission logic
answerButton.addEventListener('click', async () => {
    if (!questionList || questionList.length === 0) {
        alert('No question loaded. Please start the quiz.');
        return;
    }

    question = questionList[currentQuestionIndex];
    // get user answer
    let userAnswer;
    if (question.questionType === 1) {
        const selected = document.querySelector('input[name="choices"]:checked');
        if (!selected) {
            alert('Please select an answer before submitting.');
            return;
        }
        userAnswer = selected.value;
    } else if (question.questionType === 2) {
        const input = document.getElementById('open-answer');
        userAnswer = input.value;
        if (!userAnswer.trim()) {
            alert('Please enter an answer before submitting.');
            return;
        }
    }

    // check answer and provide feedback
    const isCorrect = checkAnswer(userAnswer, question.correctAnswer);
    if (isCorrect) {
        feedbackElement.textContent = 'Correct!';
        feedbackElement.style.color = 'green';
        feedbackElement.classList.remove('hidden');
        totalScore += question.score;
        questionCount += question.score;
        scoreElement.textContent = `Score: ${totalScore}/${questionCount}`;
        correctCount++;
        const progressPercent = (correctCount / questionList.length) * 100;
        setProgress(progressPercent);
    } else {
        feedbackElement.textContent = `Incorrect! The correct answer was: ${question.correctAnswer}`;
        feedbackElement.style.color = 'red';
        feedbackElement.classList.remove('hidden');
        questionCount += question.score;
        scoreElement.textContent = `Score: ${totalScore}/${questionCount}`;
    }
    answerButton.classList.add('hidden');
    nextButton.classList.remove('hidden');

    //disable choices after answering
    const inputs = document.querySelectorAll('input[name="choices"]');
    inputs.forEach(input => input.disabled = true);
    const openInput = document.getElementById('open-answer');
    if (openInput) openInput.disabled = true;
});

// checks the user's answer against the correct answer, ignoring case and whitespace
function checkAnswer(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return false;
    return userAnswer.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase();
}


// handle next question logic
nextButton.addEventListener('click', async () => {
    if (!questionList || questionList.length === 0) {
        alert('No question loaded. Please start the quiz.');
        return;
    }

    await animateOut();
    
    // move to next question, ensuring we loop back to start if we reach the end
    currentQuestionIndex = (currentQuestionIndex + 1) % questionList.length;
    if (currentQuestionIndex === startIndex) {
        questionElement.classList.add('hidden');
        choicesElement.style.display = 'none';
        nextButton.classList.add('hidden');
        answerButton.classList.add('hidden');
        feedbackElement.textContent = 'You have completed all questions in this category! Restart Quiz to try again.';
        feedbackElement.style.color = 'blue';
        feedbackElement.classList.remove('hidden');
    }
    else {
        renderQuestionAt(currentQuestionIndex);
        feedbackElement.classList.add('hidden');
        nextButton.classList.add('hidden');
        answerButton.classList.remove('hidden');
        await animateIn();
    }
});

// handle stop quiz logic
stopButton.addEventListener('click', () => {
    questionElement.classList.add('hidden');
    choicesElement.style.display = 'none';
    scoreContainer.style.display = 'none';
    scoreElement.classList.add('hidden');
    progressRingElement.classList.add('hidden');
    progressRingBackground.classList.add('hidden');
    nextButton.classList.add('hidden');
    answerButton.classList.add('hidden');
    stopButton.classList.add('hidden');
    startButton.classList.remove('hidden');
    feedbackElement.textContent = `Quiz stopped. Your final score was: ${totalScore}/${questionCount}`;
    feedbackElement.style.color = '#3D8D7A';
    feedbackElement.style.fontSize = '1.5rem';
    feedbackElement.classList.remove('hidden');
});

// handle start quiz logic
function startQuiz() {
    scoreContainer.style.display = 'flex';
    scoreElement.classList.remove('hidden');
    progressRingElement.classList.remove("hidden");
    progressRingBackground.classList.remove("hidden");
    questionElement.classList.remove("hidden");
    choicesElement.style.display = "flex";
    startButton.classList.add("hidden");
    stopButton.classList.remove("hidden");
    answerButton.classList.remove("hidden");
    feedbackElement.classList.add("hidden");
    totalScore = 0;
    questionCount = 0;
    correctCount = 0;
    scoreElement.textContent = `Score: ${totalScore}/${questionCount}`;

    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;
    setProgress(0);

    //load first question
    loadQuestion();
}

function animateOut() {
    return new Promise(resolve => {
        // if already hidden -> resolve immediately
        if (quizContainer.classList.contains('hidden')) return resolve();
        quizContainer.classList.remove('fade-in');
        quizContainer.classList.add('fade-out');
        feedbackElement.classList.remove('fade-in');
        feedbackElement.classList.add('fade-out');
        const handler = () => {
            quizContainer.removeEventListener('animationend', handler);
            quizContainer.classList.remove('fade-out');
            feedbackElement.classList.remove('fade-out');
            resolve();
        };
        quizContainer.addEventListener('animationend', handler);
    });
}

function animateIn() {
    return new Promise(resolve => {
        // make visible then play in animation
        quizContainer.classList.remove('hidden');
        quizContainer.classList.remove('fade-out');
        quizContainer.classList.add('fade-in');
        const handler = () => {
            quizContainer.removeEventListener('animationend', handler);
            quizContainer.classList.remove('fade-in');
            resolve();
        };
        quizContainer.addEventListener('animationend', handler);
    });
}



document.addEventListener('DOMContentLoaded', () => {
    dateElement.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    categoryElement.textContent = `Today's Category: ${getCategory()}`;
    quizContainer.classList.add('hidden');
});