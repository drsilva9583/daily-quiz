//category element
const categoryElement = document.getElementById("category");

//score and progress elements
const scoreElement = document.getElementById("score");
const progressElement = document.getElementById("progress");

//quiz elements
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
let questionList = [];
let startIndex = -1;
let currentQuestionIndex = -1;

const dayOfWeek = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
function getCategory() {
    return SUBJECT_MAP[dayOfWeek];
}

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


        //const q = questionList[startIndex];

        // store current question context for answer checking
        // currentQuestion = { question: q, subjectKey, list: questionList, startIndex: startIndex };
        // return currentQuestion;

    } catch (error) {
        console.error('Failed to load question:', error);
        questionElement.textContent = 'Error loading question. Open console for details.';
        return null;
    }
}

function renderQuestionAt(index) {
    if (!questionList || questionList.length === 0) {
        questionElement.textContent = 'No questions available for this category.';
        return;
    }
    const q = questionList[index];
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
        progressElement.value += 10;
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

// handle next question logic
nextButton.addEventListener('click', () => {
    if (!questionList || questionList.length === 0) {
        alert('No question loaded. Please start the quiz.');
        return;
    }
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
    }
});

// handle stop quiz logic
stopButton.addEventListener('click', () => {
    questionElement.classList.add('hidden');
    choicesElement.style.display = 'none';
    scoreElement.classList.add('hidden');
    progressElement.classList.add('hidden');
    nextButton.classList.add('hidden');
    answerButton.classList.add('hidden');
    stopButton.classList.add('hidden');
    startButton.classList.remove('hidden');
    feedbackElement.textContent = `Quiz stopped. Your final score was: ${totalScore}/${questionCount}`;
    feedbackElement.style.color = '#3D8D7A';
    feedbackElement.style.fontSize = '1.5rem';
    feedbackElement.classList.remove('hidden');
});

function checkAnswer(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return false;
    return userAnswer.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase();
}

function startQuiz() {
    scoreElement.classList.remove("hidden");
    progressElement.classList.remove("hidden");
    questionElement.classList.remove("hidden");
    choicesElement.style.display = "flex";
    startButton.classList.add("hidden");
    stopButton.classList.remove("hidden");
    answerButton.classList.remove("hidden");
    feedbackElement.classList.add("hidden");
    totalScore = 0;
    questionCount = 0;
    scoreElement.textContent = `Score: ${totalScore}/${questionCount}`;
    progressElement.value = 0;

    //load first question
    loadQuestion();
}

document.addEventListener('DOMContentLoaded', () => {
    categoryElement.textContent = `Today's Category: ${getCategory()}`;
});