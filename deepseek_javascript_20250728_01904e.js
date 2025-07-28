document.addEventListener('DOMContentLoaded', function() {
    // Game configuration
    const config = {
        totalNumbers: 50,
        selectCount: 6,
        minJackpot: 10000000,
        jackpotIncrement: 5000000,
        historySize: 5,
        ticketPrice: 2
    };

    // DOM elements
    const numberGrid = document.getElementById('numberGrid');
    const selectedNumbers = document.getElementById('selectedNumbers');
    const selectedCount = document.getElementById('selectedCount');
    const maxNumbers = document.getElementById('maxNumbers');
    const quickPickBtn = document.getElementById('quickPick');
    const clearBtn = document.getElementById('clearBtn');
    const playBtn = document.getElementById('playBtn');
    const winningNumbers = document.getElementById('winningNumbers');
    const resultDisplay = document.getElementById('resultDisplay');
    const historyContainer = document.getElementById('historyContainer');
    const jackpotValue = document.getElementById('jackpotValue');

    // Game state
    let selected = [];
    let gameHistory = [];
    let jackpot = parseInt(jackpotValue.textContent.replace(/,/g, ''));

    // Initialize the game
    function init() {
        maxNumbers.textContent = config.selectCount;
        
        // Create number grid
        for (let i = 1; i <= config.totalNumbers; i++) {
            const number = document.createElement('div');
            number.className = 'number';
            number.textContent = i;
            number.dataset.value = i;
            number.addEventListener('click', toggleNumber);
            numberGrid.appendChild(number);
        }
        
        // Set up buttons
        quickPickBtn.addEventListener('click', quickPick);
        clearBtn.addEventListener('click', clearSelection);
        playBtn.addEventListener('click', playGame);
        playBtn.disabled = true;
    }

    // Toggle number selection
    function toggleNumber(e) {
        const num = parseInt(e.target.dataset.value);
        const index = selected.indexOf(num);
        
        if (index === -1) {
            if (selected.length < config.selectCount) {
                selected.push(num);
                e.target.classList.add('selected');
            }
        } else {
            selected.splice(index, 1);
            e.target.classList.remove('selected');
        }
        
        updateSelectionDisplay();
    }

    // Update the selected numbers display
    function updateSelectionDisplay() {
        selectedNumbers.innerHTML = '';
        selected.forEach(num => {
            const numEl = document.createElement('div');
            numEl.className = 'selected-number';
            numEl.textContent = num;
            selectedNumbers.appendChild(numEl);
        });
        
        selectedCount.textContent = selected.length;
        playBtn.disabled = selected.length !== config.selectCount;
    }

    // Quick pick random numbers
    function quickPick() {
        clearSelection();
        
        const availableNumbers = Array.from({length: config.totalNumbers}, (_, i) => i + 1);
        for (let i = 0; i < config.selectCount; i++) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            const num = availableNumbers.splice(randomIndex, 1)[0];
            selected.push(num);
            
            // Highlight in grid
            document.querySelector(`.number[data-value="${num}"]`).classList.add('selected');
        }
        
        updateSelectionDisplay();
    }

    // Clear all selections
    function clearSelection() {
        selected = [];
        document.querySelectorAll('.number.selected').forEach(el => {
            el.classList.remove('selected');
        });
        updateSelectionDisplay();
    }

    // Play the game
    function playGame() {
        if (selected.length !== config.selectCount) return;
        
        // Generate winning numbers
        const winningNums = generateWinningNumbers();
        const matches = findMatches(selected, winningNums);
        const prize = calculatePrize(matches);
        const result = {
            date: new Date(),
            numbers: winningNums,
            playerNumbers: [...selected],
            matches,
            prize
        };
        
        // Update game history
        gameHistory.unshift(result);
        if (gameHistory.length > config.historySize) {
            gameHistory.pop();
        }
        
        // Update jackpot if not won
        if (matches < config.selectCount) {
            jackpot += config.jackpotIncrement;
            jackpotValue.textContent = jackpot.toLocaleString();
        } else {
            // Reset jackpot if won
            jackpot = config.minJackpot;
            jackpotValue.textContent = jackpot.toLocaleString();
        }
        
        // Display results
        displayResults(result);
        updateHistory();
        
        // Clear for next play
        clearSelection();
    }

    // Generate winning numbers
    function generateWinningNumbers() {
        const nums = [];
        const availableNumbers = Array.from({length: config.totalNumbers}, (_, i) => i + 1);
        
        for (let i = 0; i < config.selectCount; i++) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            nums.push(availableNumbers.splice(randomIndex, 1)[0]);
        }
        
        return nums.sort((a, b) => a - b);
    }

    // Find matching numbers
    function findMatches(playerNums, winningNums) {
        return playerNums.filter(num => winningNums.includes(num)).length;
    }

    // Calculate prize based on matches
    function calculatePrize(matches) {
        switch(matches) {
            case 6: return jackpot;
            case 5: return 50000;
            case 4: return 1000;
            case 3: return 50;
            case 2: return config.ticketPrice; // Free play
            default: return 0;
        }
    }

    // Display results
    function displayResults(result) {
        winningNumbers.innerHTML = '';
        result.numbers.forEach(num => {
            const numEl = document.createElement('div');
            numEl.className = 'winning-number';
            numEl.textContent = num;
            winningNumbers.appendChild(numEl);
        });
        
        resultDisplay.className = 'result-display ' + (result.prize > 0 ? 'win' : 'lose');
        
        if (result.prize > 0) {
            if (result.matches === config.selectCount) {
                resultDisplay.innerHTML = `
                    <h3>JACKPOT WINNER!</h3>
                    <p>You matched all ${result.matches} numbers!</p>
                    <p class="prize-amount">You win $${result.prize.toLocaleString()}!</p>
                `;
            } else {
                resultDisplay.innerHTML = `
                    <h3>You Won!</h3>
                    <p>You matched ${result.matches} numbers</p>
                    <p class="prize-amount">You win $${result.prize.toLocaleString()}!</p>
                `;
            }
        } else {
            resultDisplay.innerHTML = `
                <h3>No Win This Time</h3>
                <p>You matched ${result.matches} numbers</p>
                <p>Better luck next time!</p>
            `;
        }
    }

    // Update history display
    function updateHistory() {
        if (gameHistory.length === 0) {
            historyContainer.innerHTML = '<div class="no-history">No drawing history yet</div>';
            return;
        }
        
        historyContainer.innerHTML = '';
        gameHistory.forEach(game => {
            const gameEl = document.createElement('div');
            gameEl.className = 'history-item';
            
            const numbersEl = document.createElement('div');
            numbersEl.className = 'history-numbers';
            
            game.numbers.forEach(num => {
                const numEl = document.createElement('div');
                numEl.className = 'history-number';
                numEl.textContent = num;
                numbersEl.appendChild(numEl);
            });
            
            const dateEl = document.createElement('div');
            dateEl.className = 'history-date';
            dateEl.textContent = game.date.toLocaleDateString();
            
            const resultEl = document.createElement('div');
            resultEl.className = 'history-result';
            
            if (game.prize > 0) {
                resultEl.innerHTML = `<span class="win">Won $${game.prize.toLocaleString()}</span>`;
            } else {
                resultEl.innerHTML = '<span class="lose">No win</span>';
            }
            
            gameEl.appendChild(numbersEl);
            gameEl.appendChild(dateEl);
            gameEl.appendChild(resultEl);
            
            historyContainer.appendChild(gameEl);
        });
    }

    // Initialize the game
    init();
});