<script>
	export let name = '';
	export let points;
	export let picture;
	export let bio;

</script>

<main>
	<div class="player">
		<h2>
			{name}
		</h2>
		<img src={picture} alt="bio pic"/>
		<h3>points: {points}</h3>
		<h4>{bio}</h4>
	</div>

</main>

<style>
	main {
		text-align: center;
		max-width: 240px;
		margin: 0 auto;
	}
	h1, h2, h3, h4, h5 {
		color: darkblue;
	}
	img {
		height: 100px;
		width: 100px;
	}

	.player {
		max-width: 240px;
		overflow-wrap: break-word;
		overflow: auto;
	}

</style>