<script>
	import { fly, fade, scale } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import { quintOut } from 'svelte/easing';
    import { currentPlayer, players} from '../components/stores.js';
    import Button from '@smui/button';
	import Paper, {Title, Subtitle, Content} from '@smui/paper';

	$: currPlayer = $players[$currentPlayer];
	let grid = ['','','','','','','','',''];
	let winner;
	let turnCount = 0;
	let pcTurnCount = 0;
	$: totalCount = turnCount + pcTurnCount;
	let success = false;
	let blocked = false;
	$: winner === "O" && currPlayer.points++;  //move to player service
	$: winner === "X" && currPlayer.points--;
    
	
	const reset = () => {
	  grid = ['','','','','','','','',''];
	  winner = undefined;
	  turnCount = 0;
	  pcTurnCount = 0;
	}
	
	function spin(node, { duration }) {
		return {
			duration,
			css: t => {
				const eased = elasticOut(t);

				return `
					transform: scale(${eased}) rotate(${eased * 720}deg);
					color: hsl(
						${~~(t * 360)},
						${Math.min(100, 1000 - 1000 * t)}%,
						${Math.min(50, 500 - 500 * t)}%
					);`
			}
		};
	}

	//winning conditions Across rows	
  function winA (player) {
    for (let i = 0; i < 7 ; i+=3) {  // i is 0 then 3 then 6
      if (grid[i] === player && grid[i+1] === player && grid[i+2] === player){  // covers 0,1,2/ 3,4,5/ 6,7,8
          winner = player;
        }
      }
    //winning conditions down colums
    for (let h = 0; h < 3 ; h++) {  // h 0, 1, 2
      if (grid[h] === player && grid[h+3] === player && grid[h+6] === player){  // covers 0,3,6  1,4,7  2,5,8
        winner = player;
        }
      }
    //diagonal winning conditions
        if ( (grid[0] + grid[4] + grid[8]) === (player+player+player) || (grid[2] + grid[4] + grid[6]) === (player+player+player)){  // covers 0,3,6  1,4,7  2,5,8
          winner = player;
		}
	}
	
	//generates random number for pc player
	const rand = () => {
		const number = Math.floor(Math.random()*9);
		return (!grid[number] ? number : rand())
      }

	//called with mousedown on a box
	const play = choice => {
		  turnCount +=1;
		  grid[choice] = 'O';                            //sets the grid number on the board to 'O'
		  success = true;
		  winA('O');   //check for a win
	}
	//called on mouseup
	const computer = async () => {
			pcTurnCount+=1;
			success = false;
			const delay = new Promise(resolve => setTimeout(() => resolve('completed'), 500));		
			await delay//.then((message) => {
			grid[rand()] = 'X';			//sets X on random board tile
			winA('X');  //})
	}

	const pcCanPLay = () => turnCount === (1 + pcTurnCount) && totalCount < 9 && !winner && success	

	const uCanPlay = i => !winner && turnCount === pcTurnCount && !blocked && !grid[i]  

</script>

<main transition:scale="{{duration: 1000, delay: 200, opacity: 0.5, start: 0, easing: quintOut}}">
	<h1>Welcome to Tic Tac Toe!</h1>
    {#if winner === 'O'}
        <p>You got a point.</p>
		<h3 in:spin="{{duration: 6000}}">Congratulations, you won!</h3>
    {:else if winner === 'X'}
        <p>You lost a point.</p>
		<h3 transition:fly="{{ y: -100, duration: 2000 }}">The computer won.</h3>
	{:else if totalCount >= 9}
		<h3 transition:fly="{{ y: -100, duration: 2000 }}">It's a tie!</h3>
	{/if}
	<div class="grid-container">
		{#each grid as square, i (i)}	
			<div id={i} on:mousedown={() => uCanPlay(i) && play(i)} on:mouseup={() => pcCanPLay() && computer()} class="grid-item">
				{#if square}
				<p transition:fade
                on:introstart={() => blocked = true}
                on:introend={() => blocked = false}
                >{square}</p>
				{/if}
			</div>
		{/each}
	</div>

	<Button on:click={() => reset()} variant="raised">Reset The Game</Button>

</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 80%;
		margin: 0 auto;
	}

	/* span {
            font-size: 1.5em;
            padding-right: 1px;
            margin: 0;
    	 } */

	h1 {
		color: darkblue;
        text-transform: none;
        font-size: 2em;
        font-weight: 100;
	}

	.grid-container {
		display: grid;
		grid-template-columns: auto auto auto;
		background-color: #2196F3;
		grid-gap: 10px;
		padding: 10px;
		height: 500px;
		width: 500px;
		margin: 10px auto;
	}

	.grid-item {
		background-color: rgba(255, 255, 255, 0.8);
  		border: 1px solid rgba(0, 0, 0, 0.8);
  		font-size: 50px;
  		text-align: center;
		width: 155px;
		height: 155px;
	}

	@media only screen and (max-width: 640px) {
		main {
		text-align: center;
		font-family: sans-serif;
		padding: .5em;
		max-width: none;
		margin: 0 auto;
		}

		.grid-container {
		display: grid;
		grid-template-columns: auto auto auto;
		background-color: #2196F3;
		grid-gap: 5px;
		padding: 5px;
		height: 250px;
		width: 250px;
		margin: 5px auto;
		}
		.grid-item {
		background-color: rgba(255, 255, 255, 0.8);
  		border: 1px solid rgba(0, 0, 0, 0.8);
  		font-size: 30px;
  		text-align: center;
		width: 77px;
		height: 77px;
		}
	}

</style>