// game settings, set when a new puzzle starts
let size = 4;
let level = 1;
let difficulty = "easy";
let boxRows = 2;
let boxCols = 2;
let gameSymbols = [];

let solution = [];
let puzzle = [];
let grid = [];
let selectedRow = 0;
let selectedCol = 0;
let finished = false;
let showNumbers = false;

// score, mistakes, hints and undo
let score = 0;
let mistakes = 0;
let maxMistakes = 3;
let hintsLeft = 1;
let moveHistory = [];  // every move, so it can be undone
let scoredCells = [];  // cells that already gave points, so undo can't be used to farm points

// timer
let seconds = 0;
let timer = null;

// how many squares to empty for each grid size and difficulty
let removeCounts = {
    4: { easy: 6, medium: 8, hard: 10 },
    6: { easy: 14, medium: 18, hard: 22 },
    9: { easy: 36, medium: 46, hard: 52 }
};

// bigger grids allow more mistakes
let mistakeLimits = { 4: 3, 6: 4, 9: 5 };

// ---------- making the puzzle ----------

function makeEmpty() {
    let g = [];
    for (let r = 0; r < size; r++) {
        let row = [];
        for (let c = 0; c < size; c++) {
            row.push(0);
        }
        g.push(row);
    }
    return g;
}

function copyGrid(g) {
    return g.map(row => row.slice());
}

// check if symbol n can go at row r, column c
function canPlace(g, r, c, n) {
    for (let i = 0; i < size; i++) {
        if (g[r][i] == n || g[i][c] == n) {
            return false;
        }
    }
    let startRow = Math.floor(r / boxRows) * boxRows;
    let startCol = Math.floor(c / boxCols) * boxCols;
    for (let i = 0; i < boxRows; i++) {
        for (let j = 0; j < boxCols; j++) {
            if (g[startRow + i][startCol + j] == n) {
                return false;
            }
        }
    }
    return true;
}

// fill the whole grid using backtracking
function fillGrid(g) {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (g[r][c] == 0) {
                let nums = [];
                for (let n = 1; n <= size; n++) {
                    nums.push(n);
                }
                shuffle(nums);
                for (let n of nums) {
                    if (canPlace(g, r, c, n)) {
                        g[r][c] = n;
                        if (fillGrid(g)) {
                            return true;
                        }
                        g[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// count solutions, stopping early once we find more than one
function countSolutions(g) {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (g[r][c] == 0) {
                let count = 0;
                for (let n = 1; n <= size; n++) {
                    if (canPlace(g, r, c, n)) {
                        g[r][c] = n;
                        count += countSolutions(g);
                        g[r][c] = 0;
                        if (count > 1) {
                            return count;
                        }
                    }
                }
                return count;
            }
        }
    }
    return 1;
}

// make a full grid, then remove cells while keeping one solution
function makePuzzle() {
    solution = makeEmpty();
    fillGrid(solution);
    puzzle = copyGrid(solution);

    let toRemove = removeCounts[size][difficulty];
    let cells = [];
    for (let i = 0; i < size * size; i++) {
        cells.push(i);
    }
    shuffle(cells);

    let removed = 0;
    for (let k of cells) {
        if (removed >= toRemove) {
            break;
        }
        let r = Math.floor(k / size);
        let c = k % size;
        let backup = puzzle[r][c];
        puzzle[r][c] = 0;

        if (countSolutions(copyGrid(puzzle)) != 1) {
            puzzle[r][c] = backup;
        } else {
            removed++;
        }
    }
    grid = copyGrid(puzzle);
}

// ---------- drawing ----------

function sameBox(r1, c1, r2, c2) {
    return Math.floor(r1 / boxRows) == Math.floor(r2 / boxRows) &&
        Math.floor(c1 / boxCols) == Math.floor(c2 / boxCols);
}

function drawBoard() {
    let board = document.getElementById("board");
    board.innerHTML = "";
    board.style.gridTemplateColumns = "repeat(" + size + ", 1fr)";

    let selectedValue = grid[selectedRow][selectedCol];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            let cell = document.createElement("button");
            cell.className = "cell";

            // thick lines between boxes
            if ((c + 1) % boxCols == 0 && c != size - 1) {
                cell.classList.add("box-right");
            }
            if ((r + 1) % boxRows == 0 && r != size - 1) {
                cell.classList.add("box-bottom");
            }
            if (c == size - 1) {
                cell.classList.add("last-col");
            }
            if (r == size - 1) {
                cell.classList.add("last-row");
            }

            // highlights: row, column and box of the chosen square, then matching symbols
            if (r == selectedRow || c == selectedCol || sameBox(r, c, selectedRow, selectedCol)) {
                cell.classList.add("zone");
            }
            if (selectedValue != 0 && grid[r][c] == selectedValue) {
                cell.classList.add("same");
            }
            if (puzzle[r][c] != 0) {
                cell.classList.add("given");
            } else if (grid[r][c] != 0 && grid[r][c] != solution[r][c]) {
                cell.classList.add("wrong");
            }
            if (r == selectedRow && c == selectedCol) {
                cell.classList.add("picked");
            }

            if (grid[r][c] != 0) {
                let html = symbolHtml(gameSymbols[grid[r][c] - 1]);
                if (showNumbers) {
                    html = '<span class="num">' + grid[r][c] + '</span>' + html;
                }
                cell.innerHTML = html;
            }

            cell.onclick = function () {
                selectedRow = r;
                selectedCol = c;
                drawAll();
            };
            board.appendChild(cell);
        }
    }
}

// how many of symbol n are correctly placed
function countPlaced(n) {
    let count = 0;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c] == n && solution[r][c] == n) {
                count++;
            }
        }
    }
    return count;
}

function drawPalette() {
    let palette = document.getElementById("palette");
    palette.innerHTML = "";

    for (let n = 1; n <= size; n++) {
        let left = size - countPlaced(n);
        let key = document.createElement("button");
        key.className = "key press";

        let html = symbolHtml(gameSymbols[n - 1]);
        if (showNumbers) {
            html += '<div><b>' + n + ' · ' + gameSymbols[n - 1].name + '</b>';
        } else {
            html += '<div><b>' + gameSymbols[n - 1].name + '</b>';
        }
        html += '<small>' + (left == 0 ? "All placed" : left + " left") + '</small></div>';
        key.innerHTML = html;

        if (left == 0) {
            // every one of this symbol is placed, so it can't be picked
            key.classList.add("done");
            key.disabled = true;
        } else {
            key.onclick = function () {
                placeSymbol(n);
            };
        }
        palette.appendChild(key);
    }
}

function drawInfo() {
    let value = grid[selectedRow][selectedCol];
    if (value == 0) {
        document.getElementById("infoLabel").textContent = "Selected square";
        document.getElementById("infoTitle").textContent = "Empty square";
        document.getElementById("infoText").textContent = "Pick a symbol below to place it here.";
    } else {
        let s = gameSymbols[value - 1];
        document.getElementById("infoLabel").textContent = "This symbol means";
        document.getElementById("infoTitle").textContent = s.name;
        document.getElementById("infoText").textContent = s.meaning;
    }
}

function drawStatus() {
    document.getElementById("scoreText").textContent = score;
    let m = document.getElementById("mistakesText");
    m.textContent = mistakes + "/" + maxMistakes;
    m.style.color = mistakes > 0 ? "var(--wrong)" : "";

    document.getElementById("hintBadge").textContent = hintsLeft;

    let numBadge = document.getElementById("numBadge");
    numBadge.textContent = showNumbers ? "ON" : "OFF";
    numBadge.className = showNumbers ? "badge" : "badge off";
}

function drawAll() {
    drawBoard();
    drawPalette();
    drawInfo();
    drawStatus();
}

// ---------- playing ----------

// put symbol n (or 0 to erase) in the selected square
function placeSymbol(n) {
    let r = selectedRow;
    let c = selectedCol;
    if (finished || puzzle[r][c] != 0 || grid[r][c] == n) {
        return;
    }

    // remember the move so it can be undone
    moveHistory.push({ r: r, c: c, old: grid[r][c] });
    grid[r][c] = n;

    if (n != 0) {
        if (n == solution[r][c]) {
            // points only the first time a square is filled correctly
            let key = r + "-" + c;
            if (!scoredCells.includes(key)) {
                scoredCells.push(key);
                score += 10;
            }
        } else {
            mistakes++;
            score = Math.max(0, score - 5);
        }
    }

    drawAll();

    if (mistakes >= maxMistakes) {
        gameOver();
    } else {
        checkWin();
    }
}

function undoMove() {
    if (finished || moveHistory.length == 0) {
        return;
    }
    let move = moveHistory.pop();
    grid[move.r][move.c] = move.old;
    selectedRow = move.r;
    selectedCol = move.c;
    drawAll();
}

// fill the selected square with the right symbol (no points for it)
function useHint() {
    let r = selectedRow;
    let c = selectedCol;
    if (finished || hintsLeft == 0 || puzzle[r][c] != 0 || grid[r][c] == solution[r][c]) {
        return;
    }
    moveHistory.push({ r: r, c: c, old: grid[r][c] });
    grid[r][c] = solution[r][c];
    scoredCells.push(r + "-" + c);
    hintsLeft--;
    drawAll();
    checkWin();
}

function checkWin() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c] != solution[r][c]) {
                return;
            }
        }
    }
    finished = true;
    clearInterval(timer);

    // bonus points for every mistake you didn't use
    score += (maxMistakes - mistakes) * 20;
    drawStatus();
    saveGame();
}

function gameOver() {
    finished = true;
    clearInterval(timer);
    showEnd("Out of mistakes", "Every master was once a beginner. Try again.", "Read the rules", "rules.html");
}

// save the finished puzzle to the player's progress
function saveGame() {
    let user = getCurrentUser();
    let oldLevel = getCurrentLevel(user);

    user.games.push({
        level: level,
        size: size,
        difficulty: difficulty,
        score: score,
        time: seconds,
        date: new Date().toISOString()
    });
    updateUser(user);

    let text = "Solved in " + formatTime(seconds) + " with " + score + " points.";
    let title = "Ayekoo!";

    if (getCurrentLevel(user) > 3 && oldLevel <= 3) {
        // finished level 3 for the first time: every symbol is collected
        title = "Ayekoo, master!";
        text += " You've mastered all 9 Adinkra symbols! But the story isn't over: new symbols and a bigger challenge are on the way. Keep your streak alive so you're ready.";
    } else if (getCurrentLevel(user) > oldLevel) {
        // finished level 1 or 2 for the first time
        text += " New level and symbols unlocked!";
        fillLevelSelect();
    }
    showEnd(title, text, "Take the symbol quiz", "quiz.html");
}

function showEnd(title, text, linkText, linkHref) {
    document.getElementById("endTitle").textContent = title;
    document.getElementById("endText").textContent = text;
    let link = document.getElementById("endLink");
    link.textContent = linkText;
    link.href = linkHref;
    document.getElementById("endOverlay").classList.add("show");
}

// ---------- timer ----------

function formatTime(total) {
    let m = Math.floor(total / 60);
    let s = total % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

function startTimer() {
    clearInterval(timer);
    seconds = 0;
    document.getElementById("timeText").textContent = "00:00";
    timer = setInterval(function () {
        seconds++;
        document.getElementById("timeText").textContent = formatTime(seconds);
    }, 1000);
}

// ---------- starting a game ----------

function startGame(newLevel, newDifficulty) {
    level = newLevel;
    difficulty = newDifficulty;
    size = gridSizes[level];
    boxRows = (size == 9) ? 3 : 2;
    boxCols = (size == 4) ? 2 : 3;
    gameSymbols = symbols.filter(s => s.level <= level).slice(0, size);

    finished = false;
    score = 0;
    mistakes = 0;
    maxMistakes = mistakeLimits[size];
    hintsLeft = 1;
    moveHistory = [];
    scoredCells = [];

    let names = { easy: "Easy", medium: "Medium", hard: "Hard" };
    document.getElementById("title").textContent = "Level " + level;
    document.getElementById("subtitle").textContent = size + "×" + size + " · " + names[difficulty];
    document.getElementById("endOverlay").classList.remove("show");

    makePuzzle();

    // start on the first empty square
    selectedRow = 0;
    selectedCol = 0;
    for (let r = size - 1; r >= 0; r--) {
        for (let c = size - 1; c >= 0; c--) {
            if (puzzle[r][c] == 0) {
                selectedRow = r;
                selectedCol = c;
            }
        }
    }

    drawAll();
    startTimer();
}

// only show levels the player has unlocked
function fillLevelSelect() {
    let user = getCurrentUser();
    let maxLevel = Math.min(getCurrentLevel(user), 3);
    let select = document.getElementById("levelSelect");
    select.innerHTML = "";

    for (let l = 1; l <= maxLevel; l++) {
        let option = document.createElement("option");
        option.value = l;
        option.textContent = "Level " + l + " (" + gridSizes[l] + "×" + gridSizes[l] + ")";
        if (l == level) {
            option.selected = true;
        }
        select.appendChild(option);
    }
}

function newPuzzle() {
    let chosenLevel = Number(document.getElementById("levelSelect").value);
    let chosenDifficulty = document.getElementById("difficultySelect").value;
    startGame(chosenLevel, chosenDifficulty);
}

// called once when play.html loads
function setupPage() {
    let user = requireLogin();
    drawNav("play");

    // best score so far
    let best = 0;
    for (let g of user.games) {
        if (g.score > best) {
            best = g.score;
        }
    }
    document.getElementById("bestText").textContent = best;

    level = Math.min(getCurrentLevel(user), 3);
    fillLevelSelect();

    document.getElementById("newPuzzleBtn").onclick = newPuzzle;
    document.getElementById("endAgain").onclick = newPuzzle;
    document.getElementById("undoBtn").onclick = undoMove;
    document.getElementById("eraseBtn").onclick = function () {
        placeSymbol(0);
    };
    document.getElementById("hintBtn").onclick = useHint;
    document.getElementById("numbersBtn").onclick = function () {
        showNumbers = !showNumbers;
        drawAll();
    };

    startGame(level, "easy");
}
