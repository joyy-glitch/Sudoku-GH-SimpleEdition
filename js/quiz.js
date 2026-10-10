let quizSymbols = [];
let questions = [];
let current = 0;
let score = 0;
let answered = false;

function drawSteps() {
    let html = "";
    for (let i = 0; i < questions.length; i++) {
        let done = i < current || (i == current && answered);
        html += done ? '<div class="done"></div>' : "<div></div>";
    }
    document.getElementById("steps").innerHTML = html;
}

function showQuestion() {
    answered = false;
    let q = questions[current];

    document.getElementById("progress").textContent = "Question " + (current + 1) + " of " + questions.length + " · Which symbol means";
    document.getElementById("question").textContent = "“" + q.meaning + "”";

    let feedback = document.getElementById("feedback");
    feedback.className = "feedback";
    feedback.textContent = "Tap the symbol you think it is.";

    let nextBtn = document.getElementById("nextBtn");
    nextBtn.style.visibility = "hidden";
    nextBtn.textContent = (current == questions.length - 1) ? "See my score" : "Next question";

    // the right answer plus up to 3 wrong ones
    let others = quizSymbols.filter(s => s.name != q.name);
    shuffle(others);
    let options = others.slice(0, 3);
    options.push(q);
    shuffle(options);

    let box = document.getElementById("options");
    box.innerHTML = "";

    for (let opt of options) {
        let btn = document.createElement("button");
        btn.className = "option press";
        btn.innerHTML = symbolHtml(opt) + opt.name;
        btn.dataset.name = opt.name;
        btn.onclick = function () {
            checkAnswer(btn, opt, q);
        };
        box.appendChild(btn);
    }
    drawSteps();
}

function checkAnswer(btn, opt, q) {
    if (answered) {
        return;
    }
    answered = true;

    let feedback = document.getElementById("feedback");
    if (opt.name == q.name) {
        score++;
        btn.classList.add("right");
        feedback.className = "feedback good";
        feedback.textContent = "Correct! That's " + q.name + ".";
    } else {
        btn.classList.add("wrong-answer");
        feedback.className = "feedback bad";
        feedback.textContent = "Not quite. The answer is " + q.name + ".";

        // also show which one was right
        for (let b of document.querySelectorAll(".option")) {
            if (b.dataset.name == q.name) {
                b.classList.add("right");
            }
        }
    }
    document.getElementById("nextBtn").style.visibility = "visible";
    drawSteps();
}

function finishQuiz() {
    // save the score to the player's progress
    let user = getCurrentUser();
    user.quizzes.push({
        score: score,
        total: questions.length,
        date: new Date().toISOString()
    });
    updateUser(user);

    let titles = ["Keep practising!", "Good start!", "Nice work!", "Great job!", "Ayekoo!"];
    let percent = score / questions.length;
    let title = titles[Math.round(percent * 4)];

    document.getElementById("quizArea").style.display = "none";
    document.getElementById("resultArea").style.display = "block";
    document.getElementById("resultScore").textContent = score + "/" + questions.length;
    document.getElementById("resultTitle").textContent = title;
}

function startQuiz() {
    current = 0;
    score = 0;
    questions = shuffle(quizSymbols.slice()).slice(0, Math.min(5, quizSymbols.length));
    document.getElementById("quizArea").style.display = "block";
    document.getElementById("resultArea").style.display = "none";
    showQuestion();
}

// called once when quiz.html loads
function setupQuiz() {
    let user = requireLogin();
    drawNav("quiz");
    quizSymbols = getUnlockedSymbols(user);

    document.getElementById("nextBtn").onclick = function () {
        current++;
        if (current < questions.length) {
            showQuestion();
        } else {
            finishQuiz();
        }
    };

    document.getElementById("againBtn").onclick = startQuiz;

    startQuiz();
}
