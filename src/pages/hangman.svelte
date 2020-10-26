<script>
    import { scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import APInputs from '../components/wordlistAPI.svelte'
    import Card from '@smui/card'
    import Button from '@smui/button';
    import { addPoint, minusPoint } from "../playerService.js"

    let game = [];
    let won;
    let word;
    let wordArr = [];
    let text;
    let toggle = false;
    let correct;
    let guesses = [];
    let graphic = ["", "___","|  O","| -|-","|  /|","|___"]
    let hangman = [];
    $: chances = 6 - guesses.length;
    $: won && addPoint();
    $: !chances && minusPoint();
    $: gameOver = `${wordArr.join('')} was the word. Game Over, Click Restart to play again.`
    
    let wordList = [
        'apple', 'answer', 'anchor', 'bananna', 'berry', 'boat', 'boot', 'cape', 'cap', 'case', 'chip', 'cherry', 'cone', 'dark', 'deep', 'donkey', 'eight', 'ever', 'elephant', 'fire', 'food', 'good', 'great', 'hour', 'ink', 'jar', 'jump', 'juggle', 'kick', 'kangaroo', 'leopard', 'moon', 'night', 'opera', 'people', 'quiet', 'right', 'scissor', 'temple', 'unicorn', 'victorious', 'wink', 'xylophone', 'yelp', 'zebra'  //list game chooses from
    ];
    
    const getList = (e) => {
    wordList = [];
    wordList = e.detail.map(el => el.word);
    console.log(wordList)
    start();
    wordList ? toggle = true : toggle = false;
    }
    
    const randWord = () => wordList[Math.floor(Math.random()*wordList.length)];
    
    const start = () => {
        won = false;
        toggle = false;
        word = randWord();
        hangman = [];
        guesses = [];
        correct = undefined;
        text = '';
        wordArr = word.split('');   //turns the string into an array
        game = wordArr.map(e => e = '_')
        }
    
    const checkGuess = letter => wordArr.includes(letter) ? play(letter) : wrong(letter);
    
    const wrong = letter => {
        hangman = [...hangman, graphic[guesses.length]]
        guesses = [...guesses, letter];
        correct = false;
    }
    
    const play = letter => {
        wordArr.forEach((el, index) => el === letter ? game[index] = letter : null)
        compareArrays()
        correct = true;
    }
    
    const compareArrays = () => JSON.stringify(game) === JSON.stringify(wordArr) ? won = true : won =false;
    
    start();
    
    </script>
    
    <main transition:scale="{{duration: 1000, delay: 200, opacity: 0.5, start: 0, easing: quintOut}}">
        <Card>
            <h1>Welcome to Hangman</h1>
            <APInputs on:getlist={getList}/>
            {#if toggle}
            <p>The wordlist is ready.</p>
            {/if}
            
            <div class="flex-box">
                <div class="flex-item1">
                    {#if !won && chances > 0}
                    <h3>You have {chances} guesses.</h3>
                    <span>Your guess:</span>
                    <input bind:value={text} on:keydown={(event) => {if (event.key === 'Enter') checkGuess(text.toLowerCase())} } >
                    <div class="btn-container">
                        <Button variant="raised" on:click={() => checkGuess(text.toLowerCase())}>Guess</Button>
                    </div>
                    {:else if !chances}
                    <h2>{gameOver}</h2>
                    {/if}
                    
                    <span>Wrong guesses: {guesses}</span>
                    {#if won}	
                    <p class="congrats">'You won! Click reset to play again'</p>
                    {:else if correct === undefined}
                    <p>New Game</p>
                    {:else if correct}
                    <p>'You got a letter right!'</p>
                    {:else if !correct}
                    <p>'Sorry, you guessed wrong.'</p>
                    {/if}
                    <div id="game">{game.join(' ')}</div>
                    <div class="btn-container">
                        <Button on:click={() => start()}>Reset</Button>
                    </div>
                </div>
                <div class="flex-item2">
                    {#each hangman as man}
                    <p class="man">{man}</p>
                    {/each}
                </div>
            </div>
        </Card>
    </main>
        
        <style>
        main {
            text-align: center;
            font-family: sans-serif;
            margin: 24px;
        }

        .flex-box {
            display: inline-flex;
            justify-content: center;
        }

        .flex-item1 {
            margin-right: 20px;
        }

        .flex-item2 {
            margin-left: 20px;
        }

        .btn-container {
            max-width: 100px;
            margin: 10px auto;
        }
    
        h1 {
            color:darkblue;
            text-transform: none;
            font-size: 2em;
            font-weight: 100;
        }
    
        #game {
            font-size: 2.5em;
          }
          span, p {
            font-size: 1.5em;
            padding-right: 1px;
            margin: 0 5px;
          }
          
          input {
            font-size: 1.5em;
            width: 150px;
            margin: 0 auto;
          }
    
          .congrats {
              font-size: 1.5em;
              font-weight: bold;
              color: rgb(255, 0, 225);
          }
    
          .man {
              text-align: center;
          }
    </style>