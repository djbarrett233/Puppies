/**
   * Array with image source links to be retrieved and inserted into the HTML when cards are created
   */

 const cardDeck = [
    "Puppy1.jpg",
    "puppy2.jpg",
    "puppy3.jpg",
    "puppy4.jpg",
    "puppy5.jpg",
    "puppy6.jpg",
    "puppy7.jpg",
    "puppy8.jpg",
];

const gameId = 'board-game';
const delayBeforeRemovingCards = 100;
const maxTopScores = 10;
const gameTime = 120; // Total time in seconds that the player has to match all of the cards

class BoardGame {
    constructor(totalTime) {
        this.fullDeck = [];
        this.totalTurns = 0;
        this.totalTime = totalTime;
        this.timeLeft = totalTime;
        this.turns = document.getElementById("turns");
        this.timer = document.getElementById("time-left");
        this.configuration = null;
        this.playerPanel = document.getElementById("playerPanel");
        this.boardPanel = document.getElementById("main-gameboard");
        this.checkCard = null; // Sets the card as the card to be matched
        this.addListeners();
    }

    /**
       * Starts the BoardGame application - it is called when an instance of the class is created
       */

    start() {
        this.loadConfiguration();
        this.showPlayerPanel();
    }

    addListeners() {
        let playerForm = document.getElementById("playerForm");
        playerForm.addEventListener("submit", this.onStartGameHandler.bind(this)); // Returns bound function that will be invoked later
    }

    /**
       * Loads the game configuration from localStorage. If the configuration doesn't exist, a default is created
       */

    loadConfiguration() {
        this.configuration = JSON.parse(localStorage.getItem(gameId));
        if (!this.configuration) { // Sets configuration to the default value
            this.configuration = {
                playerName: "",
                scores: [],
            };
        }
    }

    /**
       * Sets the game cards, timer, turn counter and card actions for the game screen
       */

    startGame() {
        this.checkCard = null;
        this.totalTurns = 0;
        this.timeLeft = this.totalTime;
        this.matchedCards = []; // Array which will store the matched cards as the game progresses
        this.busy = true;
        setTimeout(() => {
            this.shuffleDeck(this.fullDeck);
            this.countDown = this.startCountDown();
            this.busy = false;
        }, 500);
        this.hideCards();
        this.timer.innerText = this.timeLeft;
        this.turns.innerText = this.totalTurns;
        this.showBoardPanel();
        this.appendCards();
        this.subscribeButton();
    }

    /**
       * Loads the player name and score from localStorage
       */

    showPlayerPanel() {
        document.getElementById("playerName").value = this.configuration.playerName;
        this.renderScores();
        this.boardPanel.classList.toggle("d-none", true);
        this.playerPanel.classList.toggle("d-none", false);
    }

    showBoardPanel() {
        this.playerPanel.classList.toggle("d-none", true);
        this.boardPanel.classList.toggle("d-none", false);
    }

    /**
     * Renders the score table and appends a table to the scores container. 
     * If the table already exists, it is removed and created from scratch
     */

    renderScores() {
        let scoresContainer = document.getElementById("scores");
        if (scoresContainer.firstElementChild) {
            scoresContainer.firstElementChild.remove();
        }
        let table = document.createElement("table");
        let header = table.createTHead();
        let headers = header.insertRow(0);
        headers.innerHTML = `<th class="position">Position</th>
                            <th class="player-name">Player Name</th>
                            <th class="flips">Total Turns</th>
                            <th class="total-time">Total Time</th>`;
        let tblBody = document.createElement('tbody');
        this.configuration.scores.forEach((score, index) => {
            let tr = document.createElement("tr");
            tr.innerHTML = `<td class="position">${index + 1}</td> 
                            <td class="player-name">${score.playerName}</td>
                            <td class="flips">${score.flips}</td>
                            <td class="total-time">${score.totalTime}</td>`;
            if (score.currentPlayer) {
                tr.classList.add('last-game');
            }
            tblBody.appendChild(tr);
        });
        table.appendChild(tblBody);
        scoresContainer.appendChild(table);
    }

    /**
     * Event handler to handle the onsubmit event fired from the playerForm 'Start Game!' button
     * @param {*} event DOM Event
     */

    onStartGameHandler(event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        // Assigns the current player's name to the configuration object to start the game
        this.configuration.playerName = event.target[0].value;
        //Starts the game
        this.startGame();
    }
    
    popSound() {
        let audio = new Audio("assets/audio/pop.mp3");
        audio.play();
    }
    /**
     * Renders the card element using the image name passed as a parameter
     * @param {String} imageName 
     */

    renderCard(imageName) {
        return `<div class="card">
                    <div class="card-back all-cards">
                        <img class="card-img" src="assets/images/card-back.jpg"  alt="Hidden card">
                    </div> 
                    <div class="card-picture all-cards">
                        <img class="card-value card-img" src="assets/images/${imageName}" alt="Picture card">
                    </div>
                </div>`;
    }

    /**
     * Appends the cards to the gameboard
     */

    appendCards() {
        // Creates a new array by adding the cardDeck array to itself so there is a duplicate of each image and cards can be matched
        const allCards = cardDeck.concat(cardDeck);

        const addCard = document.getElementById("main-gameboard");
        // insertAdjacentHTML inserts the HTML from the renderCard function for each item in the concatenated allCards array using the appropriate image file
        allCards.forEach((imageName) => addCard.insertAdjacentHTML("beforeend", this.renderCard(imageName)));


        let cards = Array.from(document.getElementsByClassName("card"));

        cards.forEach((card) => {
            card.addEventListener("click", () => {
                this.turnCard(card);
                this.popSound();
            });
        });
        this.fullDeck = cards; // Declares a new array of HTML cards for the game
    }

    removeCards() {
        let cards = Array.from(document.getElementsByClassName("card"));
        cards.forEach((card) => card.remove());
    }


    subscribeButton() {
        document.getElementById("subscribe-submit").addEventListener("click", function () {
            document.getElementById('email-subscribe').remove();
            document.getElementById('email-text').innerText ="Thank you. You are now subscribed!"; // Hides the form and displays a confirmation message to the user
        });
    }

    startCountDown() {
        return setInterval(() => {
            this.timeLeft--;
            this.timer.innerText = this.timeLeft;
            if (this.timeLeft === 0) 
                this.gameOver(); // Ends game when countdown reaches 0
        }, 1000);
    }

    gameFinished() {
        clearInterval(this.countDown);
        // Removes remaining cards from the board
        this.removeCards();
        this.showPlayerPanel();
    }

    currentScore() {
        let currentScore = document.getElementById('current-score');
        currentScore.innerText = this.totalTurns;
    }

    gameOver() {
        this.renderScores();
        this.boardPanel.classList.toggle("d-none", true);
        this.playerPanel.classList.toggle("d-none", false);
        this.gameFinished();
    }

    gameWin() {
        this.currentScore();
        this.updateScores();
        this.gameFinished();
    }
    /**
       * Updates the scores based on the last played game after game has been won
       */

    updateScores() {
        // Disable the previous current played game 
        let index = this.configuration.scores.findIndex((score) => score.currentPlayer === true);
        if (index !== -1) {
            this.configuration.scores[index].currentPlayer = false;
        }

        // Adds the new score to the scoreboard
        this.configuration.scores.push({
            playerName: this.configuration.playerName,
            flips: this.totalTurns,
            totalTime: this.totalTime - this.timeLeft,
            currentPlayer: true
        });

        /**
           * Sorts the scores by comparing values to include the new score - the scores on the board will be positioned high to low
           */

        this.configuration.scores.sort((a, b) => {
            if (a.flips < b.flips) {
                return -1;
            }
            if (a.flips > b.flips) {
                return 1;
            }
            if (a.totalTime < b.totalTime) {
                return -1;
            }
            if (a.totalTime > b.totalTime) {
                return 1;
            }
            return 0;
        });

        // Pop removes the last player from the list of top players if there is an overflow
        if (this.configuration.scores.length > maxTopScores) {
            this.configuration.scores.pop();
        }

        // Converts the configuration into a string and updates it in localStorage
        localStorage.setItem(gameId, JSON.stringify(this.configuration));
    }

    hideCards() {
        this.fullDeck.forEach((card) => {
            card.classList.remove('visible');
        });
    }

    /**
        * 
        * @param {Element} card The card element
        */
       
    turnCard(card) {
        if (this.isCardFacedDown(card)) {
            // Increases the number of turns 
            this.totalTurns++;
            // Increases the number of turns on screen
            this.turns.innerText = this.totalTurns;
            // Shows the card
            card.classList.add('visible');
            if (this.checkCard) {
                this.checkForMatch(card);
            } else {
                this.checkCard = card;
            }
        }
    }

    /**
     * Checks if the card is a match with the previously selected card
     * @param {Element} card 
     */

    checkForMatch(card) {
        if (this.checkCardType(card) === this.checkCardType(this.checkCard)) {
            this.cardMatcher(card, this.checkCard);
        } else {
            this.notAMatch(card, this.checkCard);
            // Clears the card selection
            this.checkCard = null;
        }
    }

    /**
        * 
        * @param {*} card1 First card selected
        * @param {*} card2 Second card selected
        */

    cardMatcher(card1, card2) {
        // Adds the cards to the matchedCards array to track progress
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        setTimeout(() => {
            card1.classList.add("invisible");
            card2.classList.add("invisible");
        }, delayBeforeRemovingCards);
        this.checkCard = null;
        // Ends the game when all cards have been matched
        if (this.matchedCards.length === this.fullDeck.length) {
            this.gameWin();
        }
    }

    notAMatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove("visible");
            card2.classList.remove("visible");
            this.busy = false;
        }, 500);
    }

    checkCardType(card) {
        return card.getElementsByClassName("card-value")[0].src;
    }

    /**
       * Fisher-Yates algorithm shuffles through the card array swapping 
       * the last element with a random element from the array
       */

    shuffleDeck() {
        for (let i = this.fullDeck.length - 1; i > 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i + 1));
            this.fullDeck[randomIndex].style.order = i;
            this.fullDeck[1].style.order = randomIndex;
        }
    }

    isCardFacedDown(card) {
        return (
            !this.busy && !this.matchedCards.includes(card) && card !== this.checkCard
        );
    }
}

const game = new BoardGame(gameTime);

