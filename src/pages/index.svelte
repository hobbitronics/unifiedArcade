<script>
	import { metatags } from '@roxi/routify'
	import { flip } from 'svelte/animate'
	import Player from '../components/player.svelte'
	import AddPlayer from '../components/addPlayer.svelte'
	import Button , {Label} from '@smui/button'
	import Card from '@smui/card'
	import Paper, {Subtitle} from '@smui/paper'
	import Dialog, {Title, Content, Actions} from '@smui/dialog'
	import { currPlayer, players, removePlayer } from "../playerService.js"

    metatags.title = 'Arcade with routify'
    metatags.description = 'Play all your favourite games in one spot'
	
	let dialog
	let dialogMessage
	let name = ''
	let showCtrl = true
	let height = [1, 1, 1]
	$: toggle = true

	const remove = name => {
		try {
			removePlayer(name)
		} catch(e) {
			dialogMessage = e
			dialog.open()
		}
	}

	const byHighScore = (player1, player2) => player2.points - player1.points

</script>
<main>
	
	<div class="controls">
		{#if showCtrl}
		<AddPlayer/>
		<form on:submit|preventDefault={() => remove(name)}>
			<input type="text" placeholder="Player to remove" bind:value={name}>
			<input type="submit" value="Remove Player" class="button"/>
		</form>
		{/if}
		<Button on:click={() => showCtrl = !showCtrl}>{#if showCtrl}Hide{:else}show{/if}</Button>
	</div>

	<Paper elevation={1} >	
		<div class="currPlayer">
			<h2>{$currPlayer.name}</h2>
			<h3>points: {$currPlayer.points}</h3>
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
		<div>
			{#if $players.length === 0}
				<p>No High Scores</p>
			{:else if toggle}
			{#each [...$players].sort(byHighScore) as player, id (player.id)}
				<div class="player-container" animate:flip="{{duration: 200}}">
					<h4>{id+1}:</h4> <Player name={player.name} points={player.points} bio={player.bio} picture={player.picture}/>
				</div>
			{/each}
			{/if}
		</div>
	</Card>

	<Dialog
		bind:this={dialog}
		aria-labelledby="dialog-title"
		aria-describedby="dialog-content">
		<Title id="dialog-title">Message to {$currPlayer.name}</Title>
		<Content id="dialog-content">
			{dialogMessage}
		</Content>
		<Actions>
			<Button>
			<Label>Ok</Label>
			</Button>
		</Actions>
	</Dialog>

	<footer>Visit <a href="https://hobbitronics.github.io" target="blank">my Github page</a> to see more of my projects.</footer>
</main>
<style>
	main {
		margin: 4px;
	}

	h2, h3, h4 {
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

	.player-container {
		max-width: 300px;
		text-align: center;
		margin: 0 auto;
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
		padding: 4px;
		margin-top: 8px;
    	margin-left: 8px;
	}

</style>