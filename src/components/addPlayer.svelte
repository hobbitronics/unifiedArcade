<script>
    import { count, players} from './stores.js';
    
    let name;
    let pid = 2;
    let bio;
    let picture;

    $: player = {
        id: pid,
        name : name,
        picture: picture,
        points : $count,
        bio: bio
    };
    const onSubmit = async () => {
        pid++;
        await gitGet(name)
        $players = [...$players, player];
    }

    async function gitGet (input) {
		let url = 'https://api.github.com/users/' + input;
		  try {
			  const response = await fetch(url)
			  const data = await response.json()	 
			  bio = `bio: ${data.bio}`;
			  picture = data.avatar_url;
			console.log(data)
		  } catch (error) {
			console.error(error)
		  }
	}

</script>
<form class="controls" on:submit|preventDefault={onSubmit}>
    <input type="text" placeholder="Your name" bind:value={name}>
    <input type="submit" value="Save" class ="btn"/>
</form>
<div class="controls"><button on:click={() => $count = 0}>reset score</button></div>

<style>
    .controls {
        display: inline;
        margin: 5px, 0;
        font-size: 18px;
    }
</style>