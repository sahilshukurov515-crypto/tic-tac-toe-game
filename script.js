class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X'; // X = Player, O = AI
        this.gameActive = true;
        this.playerScore = 0;
        this.aiScore = 0;
        this.drawScore = 0;
        this.difficulty = 'medium';
        
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        this.initializeGame();
    }

    initializeGame() {
        this.loadScores();
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });

        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('statsBtn').addEventListener('click', () => this.resetStats());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.resetGame();
        });
    }

    handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));

        if (this.board[index] !== '' || !this.gameActive || this.currentPlayer !== 'X') {
            return;
        }

        this.board[index] = 'X';
        this.updateCell(index);

        if (this.checkWinner('X')) {
            this.endGame('Kazandın! 🎉');
            this.playerScore++;
            this.saveScores();
            return;
        }

        if (this.isBoardFull()) {
            this.endGame('Berabere! 🤝');
            this.drawScore++;
            this.saveScores();
            return;
        }

        this.currentPlayer = 'O';
        this.updateStatus('Bilgisayar düşünüyor...');
        
        setTimeout(() => this.aiMove(), 600);
    }

    aiMove() {
        const availableMoves = this.board
            .map((val, idx) => val === '' ? idx : null)
            .filter(val => val !== null);

        if (availableMoves.length === 0) {
            return;
        }

        let move;

        if (this.difficulty === 'easy') {
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        } else if (this.difficulty === 'medium') {
            move = this.getMiniMaxMove('medium');
        } else {
            move = this.getMiniMaxMove('hard');
        }

        this.board[move] = 'O';
        this.updateCell(move);

        if (this.checkWinner('O')) {
            this.endGame('Bilgisayar Kazandı! 🤖');
            this.aiScore++;
            this.saveScores();
            return;
        }

        if (this.isBoardFull()) {
            this.endGame('Berabere! 🤝');
            this.drawScore++;
            this.saveScores();
            return;
        }

        this.currentPlayer = 'X';
        this.updateStatus('Senin Sırası');
    }

    getMiniMaxMove(difficulty) {
        const availableMoves = this.board
            .map((val, idx) => val === '' ? idx : null)
            .filter(val => val !== null);

        let bestScore = -Infinity;
        let bestMove = availableMoves[0];
        let moveScores = [];

        for (let move of availableMoves) {
            this.board[move] = 'O';
            let score = this.minimax(0, false, difficulty === 'hard' ? 4 : 6);
            this.board[move] = '';

            moveScores.push({ move, score });

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        if (difficulty === 'medium' && Math.random() < 0.3) {
            const sortedMoves = moveScores.sort((a, b) => b.score - a.score);
            bestMove = sortedMoves[Math.floor(Math.random() * 2)].move;
        }

        return bestMove;
    }

    minimax(depth, isMaximizing, maxDepth) {
        if (depth >= maxDepth) {
            return this.evaluateBoard();
        }

        if (this.checkWinner('O')) return 10 - depth;
        if (this.checkWinner('X')) return depth - 10;
        if (this.isBoardFull()) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (this.board[i] === '') {
                    this.board[i] = 'O';
                    let score = this.minimax(depth + 1, false, maxDepth);
                    this.board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (this.board[i] === '') {
                    this.board[i] = 'X';
                    let score = this.minimax(depth + 1, true, maxDepth);
                    this.board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    evaluateBoard() {
        let score = 0;

        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            const line = [this.board[a], this.board[b], this.board[c]];

            const oCount = line.filter(cell => cell === 'O').length;
            const xCount = line.filter(cell => cell === 'X').length;

            if (oCount > 0 && xCount === 0) {
                score += Math.pow(10, oCount);
            }
            if (xCount > 0 && oCount === 0) {
                score -= Math.pow(10, xCount);
            }
        }

        if (this.board[4] === 'O') score += 3;
        if (this.board[4] === 'X') score -= 3;

        return score;
    }

    checkWinner(player) {
        return this.winningConditions.some(condition => {
            return condition.every(index => this.board[index] === player);
        });
    }

    isBoardFull() {
        return this.board.every(cell => cell !== '');
    }

    updateCell(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = this.board[index];
        cell.classList.add(this.board[index].toLowerCase());
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    updateUI() {
        document.getElementById('playerScore').textContent = this.playerScore;
        document.getElementById('aiScore').textContent = this.aiScore;
        document.getElementById('drawScore').textContent = this.drawScore;
    }

    endGame(message) {
        this.gameActive = false;
        this.updateStatus(message);
    }

    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.updateStatus('Oyun Başladı - Senin Sırası');

        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
    }

    resetStats() {
        if (confirm('İstatistikleri sıfırlamak istediğine emin misin?')) {
            this.playerScore = 0;
            this.aiScore = 0;
            this.drawScore = 0;
            this.saveScores();
            this.updateUI();
            this.resetGame();
        }
    }

    saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify({
            player: this.playerScore,
            ai: this.aiScore,
            draw: this.drawScore
        }));
    }

    loadScores() {
        const saved = localStorage.getItem('ticTacToeScores');
        if (saved) {
            const scores = JSON.parse(saved);
            this.playerScore = scores.player;
            this.aiScore = scores.ai;
            this.drawScore = scores.draw;
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});