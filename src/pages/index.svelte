<script>
    import { metatags } from '@sveltech/routify'
    import { flip } from 'svelte/animate';
	import Player from '../components/player.svelte'
	import AddPlayer from '../components/addPlayer.svelte'
	import { count, players} from '../components/stores.js';
	import Button from '@smui/button';
	import Card from '@smui/card'
	import Paper, {Title, Subtitle, Content} from '@smui/paper';

    metatags.title = 'Arcade with routify'
    metatags.description = 'Play all your favourite games in one spot'
	
	let name;
	let showCtrl = true;
	let height = [1, 1, 1];
	$: $players[$players.length-1].points = $count
	$: toggle = true;
	$: currPlayer =
		{
			id: 0,
			name: $players[$players.length-1].name,
			points: $count
		}

	const removePlayer = () => $players = $players.filter(player => player.name !== name)
	const byHighScore = (player1, player2) => player2.points - player1.points;
</script>
<main>
	
	<div class="controls">
		{#if showCtrl}
		<AddPlayer/>
		<form on:click|preventDefault={removePlayer}>
			<input type="text" placeholder="Player to remove" bind:value={name}>
			<input type="submit" value="Remove Player" class="button"/>
		</form>
		{/if}
		<Button on:click={() => showCtrl = !showCtrl}>{#if showCtrl}Hide{:else}show{/if}</Button>
	</div>

	<Paper elevation={1} >	
		<div class="currPlayer">
			<h2>{currPlayer.name}</h2>
			<h3>points: {$count}</h3>
		</div>
	</Paper>

	<br>

	<Card padded>
		<h2 id="minibar">Games</h2>
		<div class="gameList">
			<Paper on:mouseover={() => height[0] = 4} elevation={height[0]} on:mouseout={() => height[0] = 1}>
				<a href="./ttt">Tic Tac Toe</a>
			</Paper>
			<br/>
			<Paper on:mouseover={() => height[1] = 4} elevation={height[1]} on:mouseout={() => height[1] = 1}>
				<a href="./hangman">Hangman</a>
			</Paper>
			<br/>
			<Paper on:mouseover={() => height[2] = 4} elevation={height[2]} on:mouseout={() => height[2] = 1}>
				<a href="./terminal">Bash</a>
			</Paper>
		</div>
	</Card>

	<br>

	<Card padded>
		<h2 id="minibar">High Scores</h2>
		<div class="btn-container">
			<Button on:click={() => toggle = !toggle}>{#if toggle}minimize{:else}show{/if}</Button>
		</div>
		{#if $players.length === 0}
			<p>No High Scores</p>
		{:else if toggle}
			{#each [...$players].sort(byHighScore) as player, id (player.id)}
				<div animate:flip="{{duration: 200}}">
					{id+1}: <Player name={player.name} points={player.points} bio={player.bio} picture={player.picture}/>
				</div>
			{/each}
		{/if}
	</Card>

	<footer>Visit <a href="https://github.com/hobbitronics" target="blank">my Github page</a> to see more of my projects.</footer>
</main>
<style>
	main {
		margin: 4px;
	}
	/* span {
        font-size: 1.2em;
		font-family: sans-serif;
		color: darkblue;
        padding: 5px;
        margin: 5;
    	} */

	h2, h3 {
		color: darkblue;
		}

	.currPlayer, .gameList {
		text-align: center;
		font-family: sans-serif;
		padding: 5px;
		margin: 30px auto;
		font-size: 22px;
	}

	#minibar {
		font-family: sans-serif;
		background-color: rgb(55, 135, 233);
        color: rgb(195, 252, 251);
		padding: .7em;
		border-radius: 10px;
		margin: 4px;
		text-align: center;
	}

	.btn-container {
		max-width: 100px;
		margin: 0 auto;
	}

	.button {
		margin: 8px;
		font-family: sans-serif;
	}

	.controls {
		position: fixed;
		/* left: 60%; */
		padding: 4px;
		margin-top: 8px;
    	margin-left: 8px;
	}

</style>