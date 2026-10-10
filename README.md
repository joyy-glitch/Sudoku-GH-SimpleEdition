# AdinKraze - Sudoku-GH-SimpleEdition(HTML, CSS and JS version)
A sudoku game called AdinKraze that teaches Ghanaian Adinkra symbols and their meanings. Every square is a symbol instead of a number.
# Features
Sign up and log in (saved in the browser with localStorage)
3 levels: 4×4, 6×6 and 9×9, each unlocking new symbols
Easy, Medium and Hard puzzles, generated with backtracking so each has exactly one solution
Tap a square, then a symbol. The row, column and box light up
Score, mistake limit, timer, undo, erase, a hint and a numbers option
Symbols page with flip cards showing each meaning
Quiz on the symbols you've unlocked
Light and dark mode
Works on desktop (sidebar) and phones (bottom tab bar)
# Running it
Put the folder in your web server folder (e.g. AMPPS `www`) and open `http://localhost/<folder-name>`.
Or just open `index.html` in a browser.
# Symbol images
Black PNGs with transparent backgrounds go in `images/symbols/`, named as in `js/app.js`.
The game recolours them with CSS (`mask-image`), so the same image shows gold in dark mode and purple in light mode.
