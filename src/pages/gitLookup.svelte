<script>
	import { setCurrentPlayer } from '../playerService.js';
	import Button from '@smui/button';
	let picture;
	let input;
	let output = 'enter username first';
	async function myFunction () {
		let url = 'https://api.github.com/users/' + input;
		  try {
			  const response = await fetch(url)
			  console.log(response)
			  const data = await response.json()	 
			  output = `login: ${data.login}, bio: ${data.bio}, repos url: ${data.repos_url}`;
			  picture = data.avatar_url;
			  setCurrentPlayer(data.login)
			console.log(data)
		  } catch (error) {
			console.error(error)
		  }
	}

</script>
     
<body>
	<p>type username to look up on github</p>
	Type here: <input placeholder="username" bind:value={input}>
	<Button on:click={myFunction} variation="raised">Click me</Button>
	result: <div>{output}</div>
	<img src={picture} alt="a bio"/>
</body>

