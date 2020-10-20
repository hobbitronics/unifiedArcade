<script>
	export let name = '';
	export let points;
	export let picture;
	export let id;
	export let bio;

</script>

<main>

	<h2>
		{id}: {name}
	</h2>
	<img src={picture} alt="bio pic"/>
	<h3>points: {points}</h3>
	<h4>{bio}</h4>

</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
	h1, h2, h3, h4, h5 {
		color: darkblue;
	}
	img {
		height: 50px;
		width: 50px;
	}

</style>