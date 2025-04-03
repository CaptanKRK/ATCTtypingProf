const inputField = document.getElementById('inputField');
const keys = document.querySelectorAll('.key');
const wordDisplay = document.getElementById('Word');
const levelDisplay = document.getElementById('level');
const levelUpBtn = document.getElementById('levelUp');
const levelDownBtn = document.getElementById('levelDown');
const menuToggle = document.getElementById('menuToggle');
const sideMenu = document.querySelector('.side-menu');

let currentWord = ""; // Store the current word
let currentLevel = 1;
let currentOpacitySetting = 'guided'; // Default opacity setting
let customWords = []; // Store custom words entered by the user

let wordsListByLevel = {
    1: ["cat", "dog", "rat", "hat", "bat"],
    2: ["table", "chair", "house", "phone", "write"],
    3: ["computer", "keyboard", "elephant", "building", "practice"],
    4: ["place"]
};

// Set a new random word from the current level's word list
function setRandomWord() {
    // Get all words for current level including custom words
    const words = wordsListByLevel[currentLevel] || [];
    
    // Get a random word from the list
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];
    
    // Update display
    wordDisplay.textContent = currentWord || 'No words available';
    inputField.value = '';  // Clear the input field
    
    // Update key highlighting
    highlightKeys();
    
    // Debug log
    console.log('New word set:', currentWord);
}

// Highlight the keys based on the current word and opacity setting
function highlightKeys() {
    const currentWordArray = currentWord.split('');
    
    // Clear previous highlights
    document.querySelectorAll('.key').forEach(key => key.classList.remove('highlight'));

    // Get the next character the user has to type
    const nextChar = wordDisplay.textContent[inputField.value.length];
    
    if (!nextChar) return; // Stop if there's nothing to type

    // Select all keys
    keys.forEach(key => {
        const keyText = key.textContent.trim().toLowerCase();

        // Guided mode: highlight only the next key
        if (currentOpacitySetting === 'guided') {
            if (keyText === nextChar.toLowerCase()) {
                key.classList.add('highlight');
            }
        }
        // Necessary mode: highlight all the keys in the current word
        else if (currentOpacitySetting === 'necessary') {
            if (currentWordArray.includes(keyText)) {
                key.classList.add('highlight');
            }
        }

        // Highlight uppercase letters: Shift should be highlighted first
        if (nextChar === nextChar.toUpperCase() && nextChar.match(/[A-Z]/)) {
            if (keyText === 'shift') {
                key.classList.add('highlight'); // Highlight Shift
            } else if (keyText === nextChar.toLowerCase()) {
                // Delay highlighting the uppercase letter after Shift
                setTimeout(() => {
                    key.classList.add('highlight');
                }, 150); // 150ms delay to ensure Shift appears first
            }
        } else if (keyText === nextChar.toLowerCase()) {
            // Highlight lowercase letters immediately
            key.classList.add('highlight');
        }
    });
}


opacitySettings.addEventListener('change', (event) => {
    currentOpacitySetting = event.target.value;
    highlightKeys();
});

let isShiftActive = false;
let isCapsLockActive = false; 
let isCapsLockOn = false;

// Add this check function to use in both handlers
function checkWord() {
    if (inputField.value === currentWord) { // Case-sensitive comparison
        setRandomWord();
        return true;
    }
    return false;
}

// Add a function to remove shift active state
function removeShiftActive() {
    isShiftActive = false;
    document.querySelectorAll('#shift').forEach(shiftKey => {
        shiftKey.classList.remove('active');
    });
}

// Add this function to check spelling as user types
function checkSpelling() {
    const currentInput = inputField.value;
    const targetWord = currentWord.substring(0, currentInput.length);
    
    if (currentInput === '') {
        inputField.classList.remove('correct', 'incorrect');
    } else if (currentInput === targetWord) {
        inputField.classList.add('correct');
        inputField.classList.remove('incorrect');
        
        if (currentInput === currentWord) {
            // Word completed correctly
            setTimeout(() => {
                setRandomWord();
                inputField.classList.remove('correct', 'incorrect');
            }, 300);
        }
    } else {
        inputField.classList.add('incorrect');
        inputField.classList.remove('correct');
    }
}

// Update the key click event listener to handle spaces
keys.forEach(key => {
    key.addEventListener('click', () => {
        const keyText = key.textContent.trim().toLowerCase();
        
        if (keyText === 'backspace') {
            if (inputField.value.length > 0) {
                inputField.value = inputField.value.slice(0, -1);
                currentWord = wordDisplay.textContent.substring(inputField.value.length);
                highlightKeys();
            }
            return;
        }

        // Update the shift key handling in the key click event listener
        if (keyText === 'shift') {
            isShiftActive = true;
            document.querySelectorAll('#shift').forEach(shiftKey => {
                shiftKey.classList.add('active');
            });
            highlightKeys(); // Re-highlight after activating shift
            return;
        }
        if (keyText === 'caps lock') {
            isCapsLockActive = !isCapsLockActive; // Toggle Caps Lock state
            const capsLockKey = document.getElementById('capslock');
            if (capsLockKey) {
                capsLockKey.classList.toggle('active', isCapsLockActive);
                // Remove highlight when activated
                if (isCapsLockActive) {
                    capsLockKey.classList.remove('highlight');
                }
            }
            highlightKeys(); // Update highlights
            return;
        }

        let keyval = key.textContent.trim();
        
        // Handle space key
        if (keyText === 'space') {
            keyval = ' ';
        }
        if (keyText === 'tab') {
            keyval = ' ';
        }

        // Apply caps lock if active (before shift check)
        if (isCapsLockActive) {
            keyval = keyval.toUpperCase();
        } else {
            keyval = keyval.toLowerCase();
        }

        // Apply shift if active (overrides caps lock)
        if (isShiftActive) {
            keyval = keyval.toUpperCase();
            removeShiftActive();
        }

        if (currentOpacitySetting === 'none') {
            inputField.value += keyval;
            checkSpelling();
        } else {
            // Case-sensitive comparison for guided/necessary modes
            if (keyval === currentWord[0]) {
                inputField.value += keyval;
                currentWord = currentWord.slice(1);
                checkSpelling();

                if (currentWord.length === 0) {
                    setRandomWord();
                }
                highlightKeys();
            }
        }
    });
});

// Handle level controls
levelUpBtn.addEventListener('click', () => {
    if (currentLevel < 4) {
        currentLevel++;
        updateLevel();
    }
});

levelDownBtn.addEventListener('click', () => {
    if (currentLevel > 1) {
        currentLevel--;
        updateLevel();
    }
});

function updateLevel() {
    levelDisplay.textContent = currentLevel;
    setRandomWord(); // Reset word based on the new level
}

// Initialize the word display when the page loads
setRandomWord();

// Add this function to save words permanently
function saveWords() {
    try {
        localStorage.setItem('savedWordsList', JSON.stringify(wordsListByLevel));
        console.log('Words saved successfully');
    } catch (e) {
        console.error('Failed to save words:', e);
    }
}

// Dynamically create the input field and button to add custom words
function createCustomWordInput() {
    const container = document.createElement('div');
    container.style.marginTop = '20px';
    container.className = 'custom-word-container';

    // Create input field for custom word
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter custom word';
    input.id = 'addWordInput';

    // Add focus handling to prevent typing in main input
    input.addEventListener('focus', () => {
        // Temporarily remove keyboard event listeners when add word input is focused
        document.removeEventListener('keydown', handleKeyDown);
    });

    input.addEventListener('blur', () => {
        // Restore keyboard event listeners when add word input loses focus
        document.addEventListener('keydown', handleKeyDown);
    });

    // Create button to add the word
    const button = document.createElement('button');
    button.textContent = 'Add Word';
    button.id = 'addWordButton';

    // Create message element for feedback
    const message = document.createElement('span');
    message.id = 'customWordMessage';
    message.style.marginLeft = '20px';

    // Append elements to container
    container.appendChild(input);
    container.appendChild(button);
    container.appendChild(message);

    // Add the container to the word management section instead of body
    document.getElementById('wordManagement').appendChild(container);

    // Handle adding custom words
    button.addEventListener('click', () => {
        const customWord = input.value.trim();
        if (customWord && customWord.length > 0) {
            // Keep original capitalization when adding to dictionary
            if (!wordsListByLevel[currentLevel].includes(customWord)) {
                wordsListByLevel[currentLevel].push(customWord); // Store with original caps
                message.textContent = `Added "${customWord}" to level ${currentLevel}`;
                message.style.color = 'green';
                input.value = '';
                
                // Save words permanently
                saveWords();
            } else {
                message.textContent = 'Word already exists in this level';
                message.style.color = 'red';
            }
        } else {
            message.textContent = 'Please enter a valid word';
            message.style.color = 'red';
        }
        
        // Clear message after 3 seconds
        setTimeout(() => {
            message.textContent = '';
        }, 3000);
    });

    // Add Enter key support
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            button.click();
        }
    });

    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Custom Words';
    clearButton.id = 'clearWordsButton';
    clearButton.style.marginLeft = '10px';

    // Add clear button event listener
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to remove all custom words?')) {
            // Reset to default words
            wordsListByLevel = {
                1: ["cat", "dog", "rat", "hat", "bat"],
                2: ["table", "chair", "house", "phone", "write"],
                3: ["computer", "keyboard", "elephant", "building", "practice"],
                4: ["place"]
            };
            
            // Save the default state
            saveWords();
            
            message.textContent = 'All custom words cleared';
            message.style.color = 'green';
            
            // Update current word if needed
            setRandomWord();
            
            setTimeout(() => {
                message.textContent = '';
            }, 3000);
        }
    });

    // Append clear button to container
    container.appendChild(clearButton);
}

// Add this function to load saved words on startup
function loadSavedWords() {
    const savedWords = localStorage.getItem('savedWordsList');
    if (savedWords) {
        try {
            wordsListByLevel = JSON.parse(savedWords);
            console.log('Words loaded successfully');
        } catch (e) {
            console.error('Failed to load saved words:', e);
        }
    }
}

// Call these functions in order
loadSavedWords();
createCustomWordInput();
setRandomWord(); // Initialize the word display when the page loads

// Move the keydown handler to a named function so we can remove/add it
function handleKeyDown(event) {
    // Move the existing keydown handler code here
    // Handle Caps Lock state
    if (event.getModifierState && event.getModifierState('CapsLock')) {
        isCapsLockOn = true;
    } else {
        isCapsLockOn = false;
    }

    if (event.key === 'Backspace') {
        event.preventDefault();
        if (inputField.value.length > 0) {
            inputField.value = inputField.value.slice(0, -1);
            currentWord = wordDisplay.textContent.substring(inputField.value.length);
            highlightKeys();
        }
        return;
    }

    let keyPressed = event.key;
    
    // Apply Caps Lock effect
    if (isCapsLockOn) {
        keyPressed = keyPressed.toUpperCase();
    } else {
        keyPressed = keyPressed.toLowerCase();
    }

    if (currentOpacitySetting === 'none') {
        // In 'none' mode, allow typing any character
        if (keyPressed.length === 1) {
            inputField.value += keyPressed;
            checkSpelling();
        }
    } else {
        // Guided and necessary modes: case-sensitive comparison
        if (keyPressed === currentWord[0]) {
            inputField.value += keyPressed;
            currentWord = currentWord.slice(1);
            checkSpelling();

            if (currentWord.length === 0) {
                setRandomWord();
            }
            highlightKeys();
        }
    }
}

// Replace the anonymous keydown listener with the named function
document.addEventListener('keydown', handleKeyDown);

// Update Caps Lock visual feedback
document.addEventListener('keyup', (event) => {
    if (event.key === 'CapsLock') {
        const capsLockKey = document.getElementById('capslock');
        if (capsLockKey) {
            capsLockKey.classList.toggle('active', event.getModifierState('CapsLock'));
        }
        highlightKeys();
    }
});

// Event listener for Caps Lock
document.addEventListener('keydown', (event) => {
    if (event.key === "CapsLock") {
        highlightKeys(); // Re-highlight the keys if Caps Lock is pressed
    }
});

// Add menu toggle functionality
menuToggle.addEventListener('click', () => {
    sideMenu.classList.toggle('collapsed');
    menuToggle.textContent = sideMenu.classList.contains('collapsed') ? '☰' : '×';
});

// Initialize with menu collapsed and proper icon
document.addEventListener('DOMContentLoaded', () => {
    sideMenu.classList.add('collapsed');
    menuToggle.textContent = '☰';
});
