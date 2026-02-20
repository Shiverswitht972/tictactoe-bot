<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tic-Tac-Toe</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    
    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: var(--tg-theme-bg-color, #ffffff);
            color: var(--tg-theme-text-color, #000000);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 400px;
            width: 100%;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .status {
            font-size: 18px;
            font-weight: 500;
            color: var(--tg-theme-hint-color, #999999);
            margin-bottom: 5px;
        }

        .score {
            font-size: 14px;
            color: var(--tg-theme-hint-color, #999999);
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 10px;
        }

        .board {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 30px;
            aspect-ratio: 1;
        }

        .cell {
            background: var(--tg-theme-button-color, #3390ec);
            border: none;
            border-radius: 12px;
            font-size: 48px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--tg-theme-button-text-color, #ffffff);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100px;
        }

        .cell:hover:not(:disabled) {
            transform: scale(1.05);
            opacity: 0.9;
        }

        .cell:active:not(:disabled) {
            transform: scale(0.95);
        }

        .cell:disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }

        .cell.x {
            color: #ff6b6b;
        }

        .cell.o {
            color: #4ecdc4;
        }

        .cell.winner {
            background: var(--tg-theme-button-color, #3390ec);
            animation: pulse 0.6s ease-in-out;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        .controls {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .button-row {
            display: flex;
            gap: 10px;
            justify-content: center;
        }

        button.btn {
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 500;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            background: var(--tg-theme-button-color, #3390ec);
            color: var(--tg-theme-button-text-color, #ffffff);
            transition: all 0.2s;
            flex: 1;
        }

        button.btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }

        button.btn:active {
            transform: translateY(0);
        }

        button.btn.challenge {
            background: #10b981;
        }

        button.btn.secondary {
            background: var(--tg-theme-secondary-bg-color, #f0f0f0);
            color: var(--tg-theme-text-color, #000000);
        }

        .mode-indicator {
            text-align: center;
            margin-bottom: 15px;
            font-size: 14px;
            color: var(--tg-theme-hint-color, #999999);
        }

        .thinking {
            animation: blink 1s infinite;
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 20px;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background: var(--tg-theme-bg-color, #ffffff);
            border-radius: 16px;
            padding: 24px;
            max-width: 350px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
        }

        .modal-body {
            margin-bottom: 20px;
            font-size: 15px;
            line-height: 1.5;
            color: var(--tg-theme-hint-color, #999999);
        }

        .modal-buttons {
            display: flex;
            gap: 10px;
        }

        .opponent-info {
            background: var(--tg-theme-secondary-bg-color, #f0f0f0);
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            text-align: center;
        }

        .waiting {
            text-align: center;
            padding: 20px;
            color: var(--tg-theme-hint-color, #999999);
        }

        .waiting-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid var(--tg-theme-hint-color, #999999);
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 8px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .online-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            margin-left: 6px;
            animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 Tic-Tac-Toe</h1>
            <div class="status" id="status">Player X's Turn</div>
            <div class="score">
                <span>X: <strong id="scoreX">0</strong></span>
                <span>O: <strong id="scoreO">0</strong></span>
                <span>Draws: <strong id="scoreDraw">0</strong></span>
            </div>
        </div>

        <div class="mode-indicator" id="modeIndicator">Playing vs Computer (Easy)</div>

        <div class="board" id="board">
            <button class="cell" data-index="0"></button>
            <button class="cell" data-index="1"></button>
            <button class="cell" data-index="2"></button>
            <button class="cell" data-index="3"></button>
            <button class="cell" data-index="4"></button>
            <button class="cell" data-index="5"></button>
            <button class="cell" data-index="6"></button>
            <button class="cell" data-index="7"></button>
            <button class="cell" data-index="8"></button>
        </div>

        <div class="controls">
            <div class="button-row">
                <button class="btn" id="resetBtn">New Game</button>
                <button class="btn secondary" id="modeBtn">Switch Mode</button>
            </div>
            <button class="btn challenge" id="challengeBtn">🎯 Challenge a Friend</button>
        </div>
    </div>

    <!-- Challenge Modal -->
    <div class="modal" id="challengeModal">
        <div class="modal-content">
            <div class="modal-header">Challenge a Friend</div>
            <div class="modal-body">
                Share this game with a friend on Telegram. They'll join as your opponent!
            </div>
            <div class="modal-buttons">
                <button class="btn" id="shareBtn">Share Challenge</button>
                <button class="btn secondary" id="cancelBtn">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Waiting Modal -->
    <div class="modal" id="waitingModal">
        <div class="modal-content">
            <div class="modal-header">Waiting for Opponent</div>
            <div class="waiting">
                <div class="waiting-spinner"></div>
                <span>Waiting for opponent to join...</span>
            </div>
            <div class="modal-buttons">
                <button class="btn secondary" id="cancelWaitBtn">Cancel</button>
            </div>
        </div>
    </div>

    <script>
        // ===== FIREBASE CONFIGURATION =====
        // Replace these values with your Firebase config
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
            databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT_ID.appspot.com",
            messagingSenderId: "YOUR_SENDER_ID",
            appId: "YOUR_APP_ID"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();

        // ===== TELEGRAM WEB APP =====
        let tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        // Get user info
        const userId = tg.initDataUnsafe?.user?.id || 'user_' + Math.random().toString(36).substr(2, 9);
        const userName = tg.initDataUnsafe?.user?.first_name || 'Player';

        // ===== GAME STATE =====
        let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let gameActive = true;
        let scores = { X: 0, O: 0, draw: 0 };
        let gameMode = 'ai-easy'; // 'ai-easy', 'ai-hard', '2player', 'online'
        let gameId = null;
        let mySymbol = null;
        let opponentName = null;
        let gameListener = null;

        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]              // Diagonals
        ];

        // ===== DOM ELEMENTS =====
        const cells = document.querySelectorAll('.cell');
        const statusDisplay = document.getElementById('status');
        const resetBtn = document.getElementById('resetBtn');
        const modeBtn = document.getElementById('modeBtn');
        const modeIndicator = document.getElementById('modeIndicator');
        const challengeBtn = document.getElementById('challengeBtn');
        const challengeModal = document.getElementById('challengeModal');
        const waitingModal = document.getElementById('waitingModal');
        const shareBtn = document.getElementById('shareBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const cancelWaitBtn = document.getElementById('cancelWaitBtn');

        // ===== INITIALIZATION =====
        // Load scores from localStorage
        const savedScores = localStorage.getItem('ttt-scores');
        if (savedScores) {
            scores = JSON.parse(savedScores);
            updateScoreDisplay();
        }

        // Check if opened with game parameter (joining a challenge)
        const urlParams = new URLSearchParams(window.location.search);
        const startParam = urlParams.get('tgWebAppStartParam') || urlParams.get('startapp');
        if (startParam && startParam.startsWith('game_')) {
            const joinGameId = startParam.replace('game_', '');
            joinOnlineGame(joinGameId);
        }

        // ===== SCORE FUNCTIONS =====
        function updateScoreDisplay() {
            document.getElementById('scoreX').textContent = scores.X;
            document.getElementById('scoreO').textContent = scores.O;
            document.getElementById('scoreDraw').textContent = scores.draw;
            localStorage.setItem('ttt-scores', JSON.stringify(scores));
        }

        function updateModeDisplay() {
            const modes = {
                'ai-easy': 'Playing vs Computer (Easy)',
                'ai-hard': 'Playing vs Computer (Hard)',
                '2player': 'Two Player Mode',
                'online': `Playing vs ${opponentName || 'Opponent'} <span class="online-indicator"></span>`
            };
            modeIndicator.innerHTML = modes[gameMode];
        }

        // ===== GAME LOGIC =====
        function handleCellClick(e) {
            const index = parseInt(e.target.dataset.index);

            if (board[index] !== '' || !gameActive) return;

            // In online mode, check if it's our turn
            if (gameMode === 'online') {
                if (currentPlayer !== mySymbol) {
                    tg.showAlert("It's not your turn!");
                    return;
                }
            }

            makeMove(index, currentPlayer);

            // Send move to Firebase in online mode
            if (gameMode === 'online' && gameId) {
                sendMoveToFirebase(index);
            }

            if (gameActive && gameMode.startsWith('ai') && currentPlayer === 'O') {
                setTimeout(aiMove, 500);
            }
        }

        function makeMove(index, player) {
            board[index] = player;
            const cell = cells[index];
            cell.textContent = player;
            cell.classList.add(player.toLowerCase());
            cell.disabled = true;

            const result = checkWinner();
            if (result) {
                handleGameEnd(result);
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                updateStatus();
            }
        }

        function checkWinner() {
            for (let pattern of winPatterns) {
                const [a, b, c] = pattern;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    return { winner: board[a], pattern };
                }
            }

            if (board.every(cell => cell !== '')) {
                return { winner: 'draw' };
            }

            return null;
        }

        function handleGameEnd(result) {
            gameActive = false;

            if (result.winner === 'draw') {
                statusDisplay.textContent = "It's a Draw! 🤝";
                scores.draw++;
                tg.HapticFeedback.notificationOccurred('warning');
            } else {
                let winnerText = `Player ${result.winner} Wins! 🎉`;
                
                if (gameMode === 'online') {
                    if (result.winner === mySymbol) {
                        winnerText = "You Won! 🎉";
                    } else {
                        winnerText = `${opponentName || 'Opponent'} Wins!`;
                    }
                }
                
                statusDisplay.textContent = winnerText;
                scores[result.winner]++;
                
                // Highlight winning cells
                result.pattern.forEach(index => {
                    cells[index].classList.add('winner');
                });

                tg.HapticFeedback.notificationOccurred('success');
            }

            updateScoreDisplay();

            // Update game state on Firebase for online mode
            if (gameMode === 'online' && gameId) {
                updateGameStateInFirebase(result.winner);
            }
        }

        function updateStatus() {
            if (gameActive) {
                if (gameMode === 'online') {
                    if (currentPlayer === mySymbol) {
                        statusDisplay.textContent = "Your Turn";
                    } else {
                        statusDisplay.textContent = `${opponentName || 'Opponent'}'s Turn`;
                    }
                } else if (gameMode.startsWith('ai') && currentPlayer === 'O') {
                    statusDisplay.textContent = "Computer's Turn";
                } else {
                    statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
                }
            }
        }

        function resetGame() {
            board = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            gameActive = true;

            cells.forEach(cell => {
                cell.textContent = '';
                cell.disabled = false;
                cell.className = 'cell';
            });

            // Stop listening to Firebase if in online mode
            if (gameListener) {
                gameListener.off();
                gameListener = null;
            }

            // Reset online game state
            if (gameMode === 'online') {
                gameMode = 'ai-easy';
                gameId = null;
                mySymbol = null;
                opponentName = null;
            }

            updateStatus();
            updateModeDisplay();
            tg.HapticFeedback.impactOccurred('light');
        }

        function switchMode() {
            const modes = ['ai-easy', 'ai-hard', '2player'];
            const currentIndex = modes.indexOf(gameMode);
            gameMode = modes[(currentIndex + 1) % modes.length];
            updateModeDisplay();
            resetGame();
            tg.HapticFeedback.impactOccurred('medium');
        }

        // ===== AI LOGIC =====
        function aiMove() {
            if (!gameActive) return;

            statusDisplay.textContent = 'Computer thinking...';
            statusDisplay.classList.add('thinking');

            setTimeout(() => {
                const move = gameMode === 'ai-hard' ? getBestMove() : getRandomMove();
                if (move !== -1) {
                    makeMove(move, 'O');
                }
                statusDisplay.classList.remove('thinking');
            }, 300);
        }

        function getRandomMove() {
            const availableMoves = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
            return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
        }

        function getBestMove() {
            let bestScore = -Infinity;
            let bestMove = -1;

            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, 0, false);
                    board[i] = '';
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = i;
                    }
                }
            }

            return bestMove;
        }

        function minimax(board, depth, isMaximizing) {
            const result = checkWinner();
            if (result) {
                if (result.winner === 'O') return 10 - depth;
                if (result.winner === 'X') return depth - 10;
                return 0;
            }

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < 9; i++) {
                    if (board[i] === '') {
                        board[i] = 'O';
                        let score = minimax(board, depth + 1, false);
                        board[i] = '';
                        bestScore = Math.max(score, bestScore);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < 9; i++) {
                    if (board[i] === '') {
                        board[i] = 'X';
                        let score = minimax(board, depth + 1, true);
                        board[i] = '';
                        bestScore = Math.min(score, bestScore);
                    }
                }
                return bestScore;
            }
        }

        // ===== FIREBASE MULTIPLAYER FUNCTIONS =====
        function createOnlineGame() {
            // Generate a unique game ID
            gameId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
            mySymbol = 'X'; // Creator is always X
            
            // Create game state in Firebase
            const gameState = {
                id: gameId,
                board: ['', '', '', '', '', '', '', '', ''],
                currentPlayer: 'X',
                players: {
                    X: {
                        id: userId,
                        name: userName
                    },
                    O: null
                },
                status: 'waiting',
                winner: null,
                created: firebase.database.ServerValue.TIMESTAMP
            };
            
            database.ref('games/' + gameId).set(gameState);
            
            return gameId;
        }

        function shareChallenge() {
            const gameId = createOnlineGame();
            const botUsername = 'YourBotUsername'; // TODO: Replace with your bot username
            
            // Use Telegram's share functionality
            const shareUrl = `https://t.me/${botUsername}/tictactoe?startapp=game_${gameId}`;
            const shareText = `🎮 Let's play Tic-Tac-Toe! I challenge you!`;
            
            tg.shareToStory(shareUrl, {
                text: shareText,
                widget_link: {
                    url: shareUrl,
                    name: "Play Tic-Tac-Toe"
                }
            });
            
            // Alternative: Use share URL method
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);
            
            // Show waiting modal
            challengeModal.classList.remove('active');
            waitingModal.classList.add('active');
            
            // Listen for opponent joining
            listenForOpponent(gameId);
        }

        function listenForOpponent(gameId) {
            gameListener = database.ref('games/' + gameId);
            
            gameListener.on('value', (snapshot) => {
                const gameState = snapshot.val();
                
                if (!gameState) return;

                // Check if opponent joined
                if (gameState.status === 'waiting' && gameState.players.O) {
                    waitingModal.classList.remove('active');
                    gameMode = 'online';
                    opponentName = gameState.players.O.name;
                    updateModeDisplay();
                    updateStatus();
                    tg.showAlert(`${opponentName} joined the game!`);
                    
                    // Update status to active
                    database.ref('games/' + gameId).update({ status: 'active' });
                }

                // Sync game state
                if (gameState.status === 'active') {
                    syncGameState(gameState);
                }

                // Check if game finished
                if (gameState.status === 'finished' && gameActive) {
                    const result = checkWinner();
                    if (result) {
                        handleGameEnd(result);
                    }
                }
            });
        }

        function joinOnlineGame(joinGameId) {
            gameId = joinGameId;
            
            database.ref('games/' + gameId).once('value')
                .then((snapshot) => {
                    const gameState = snapshot.val();
                    
                    if (!gameState) {
                        tg.showAlert('Game not found!');
                        return;
                    }

                    if (gameState.players.O) {
                        tg.showAlert('This game already has 2 players!');
                        return;
                    }

                    if (gameState.status !== 'waiting') {
                        tg.showAlert('This game has already started!');
                        return;
                    }

                    // Join as player O
                    mySymbol = 'O';
                    gameMode = 'online';
                    opponentName = gameState.players.X.name;
                    
                    // Update Firebase with player O
                    database.ref('games/' + gameId + '/players/O').set({
                        id: userId,
                        name: userName
                    });
                    
                    database.ref('games/' + gameId).update({ status: 'active' });
                    
                    updateModeDisplay();
                    updateStatus();
                    
                    tg.showAlert(`Joined game with ${opponentName}!`);
                    
                    // Start listening for moves
                    listenForOpponent(gameId);
                })
                .catch((error) => {
                    console.error('Error joining game:', error);
                    tg.showAlert('Error joining game!');
                });
        }

        function sendMoveToFirebase(index) {
            database.ref('games/' + gameId).update({
                board: board,
                currentPlayer: currentPlayer,
                lastMove: index,
                lastMoveTime: firebase.database.ServerValue.TIMESTAMP
            });
        }

        function updateGameStateInFirebase(winner) {
            database.ref('games/' + gameId).update({
                status: 'finished',
                winner: winner
            });
        }

        function syncGameState(gameState) {
            // Only sync if it's not our turn or if board changed
            if (currentPlayer !== mySymbol || JSON.stringify(board) !== JSON.stringify(gameState.board)) {
                board = gameState.board;
                currentPlayer = gameState.currentPlayer;
                
                // Update UI
                cells.forEach((cell, index) => {
                    if (board[index] && !cell.textContent) {
                        cell.textContent = board[index];
                        cell.classList.add(board[index].toLowerCase());
                        cell.disabled = true;
                        tg.HapticFeedback.impactOccurred('light');
                    }
                });
                
                updateStatus();
            }
        }

        // ===== EVENT LISTENERS =====
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        resetBtn.addEventListener('click', resetGame);
        modeBtn.addEventListener('click', switchMode);
        
        challengeBtn.addEventListener('click', () => {
            challengeModal.classList.add('active');
            tg.HapticFeedback.impactOccurred('medium');
        });

        shareBtn.addEventListener('click', () => {
            shareChallenge();
            tg.HapticFeedback.impactOccurred('medium');
        });

        cancelBtn.addEventListener('click', () => {
            challengeModal.classList.remove('active');
        });

        cancelWaitBtn.addEventListener('click', () => {
            waitingModal.classList.remove('active');
            if (gameListener) {
                gameListener.off();
                gameListener = null;
            }
            if (gameId) {
                // Delete the game from Firebase
                database.ref('games/' + gameId).remove();
                gameId = null;
            }
        });

        // Initialize display
        updateStatus();
        updateModeDisplay();
    </script>
</body>
</html>
