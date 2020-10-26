<script>
  import { players, currentPlayer, currPlayer, players_value, player_index, appendPlayers, resetPoints } from '../playerService.js';
  
  let name;
  let bio;
  let picture;

  const onSubmit = async () => {
      await getGitProfile(name)
      appendPlayers(name, picture, bio)
      console.log('current Player:', $currPlayer.name)
  }

  async function getGitProfile (input) {
  let url = 'https://api.github.com/users/' + input;
    try {
      const response = await fetch(url)
      const data = await response.json()	 
      bio = `bio: ${data.bio}`;
      picture = data.avatar_url;
    } catch (error) {
        console.error(error)
    }
}

</script>
<form class="controls" on:submit|preventDefault={onSubmit}>
    <input type="text" placeholder="Your name" bind:value={name}>
    <input type="submit" value="Save" class ="btn"/>
</form>
<div class="controls"><button on:click={() => resetPoints()}>reset score</button></div>

<style>
    .controls {
        display: inline;
        margin: 5px, 0;
        font-size: 18px;
    }
</style>