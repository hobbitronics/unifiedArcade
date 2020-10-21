<script>
    import { players, currentPlayer } from './stores.js';
    import Player from './player.svelte'
    import Paper from '@smui/paper';
    import { goto } from '@sveltech/routify';
    import Menu from '@smui/menu';
    import Select, {Option} from '@smui/select';
    import List, {Item, Separator, Text, PrimaryText, SecondaryText, Graphic} from '@smui/list';
    
    let menu;
    let options;
    let showProfile = false;
    let playerChoice = '';
    //put this in the player service
    const selectPlayer = () => $currentPlayer = $players.findIndex( player => player.name === playerChoice);
      
    $: playerChoice && selectPlayer();
</script>

<style>
    a {
        color: darkblue;
    }

    img {
		  /* height: 50px;
		  width: 50px;
      margin-right: 20px; */
	  }
    .navMenu {
        position: fixed;
        top: 72px;
        left: 1%;
        z-index: 10;
    }
    .optionMenu {
        position: fixed;
        top: 72px;
        left: 95%;
        z-index: 10;
    }

    .player-profile {
        position: fixed;
        top: 72px;
        left: 74%;
        z-index: 9;
        width: 240px;
    }

</style>

<div class="appBar">
    <header class="mdc-top-app-bar">
        <div class="mdc-top-app-bar__row">
          <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <button on:click={() => menu.setOpen(true)} class="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button" aria-label="Open navigation menu">menu</button>
            <span class="mdc-top-app-bar__title">Hello {$players[$currentPlayer].name}, We come to Unified Arcade App</span>
          </section>
          <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
            <button on:click={() => showProfile = !showProfile} class="material-icons mdc-top-app-bar__action-item mdc-icon-button" aria-label="portrait"><img src={$players[$currentPlayer].picture} alt="portrait"/></button>
            <Select bind:value={playerChoice} label="select player">
              <Option value=""></Option>
              {#each $players as player}
              <Option value={player.name} selected={playerChoice === player.name}>{player.name}</Option>
              {/each}
            </Select>
            <button on:click={() => options.setOpen(true)} class="material-icons mdc-top-app-bar__action-item mdc-icon-button" aria-label="Options">more_vert</button>
          </section>
        </div>
      </header>
</div>


<div class="navMenu" style="min-width: 100px;">
  <Menu bind:this={menu}>
    <List>
      <Item on:SMUI:action={() => $goto('/')}><Text>Scoreboard</Text></Item>
      <Item on:SMUI:action={() => $goto('ttt')}><Text>Tic Tac Toe</Text></Item>
      <Item on:SMUI:action={() => $goto('hangman')}><Text>Hangman</Text></Item>
      <Item on:SMUI:action={() => $goto('terminal')}><Text>Terminal Practice</Text></Item>
    </List>
  </Menu>
</div>

<div class="optionMenu" style="min-width: 50px;">
    <Menu bind:this={options}>
      <List>
        <Item on:SMUI:action={() => alert('option is selected')}><Text>option1</Text></Item>
        <Item on:SMUI:action={() => alert('option is selected')}><Text>option2</Text></Item>
        <Item on:SMUI:action={() => alert('option is selected')}><Text>option3</Text></Item>
        <Item on:SMUI:action={() => alert('option is selected')}><Text>option4</Text></Item>
      </List>
    </Menu>
  </div>

  {#if showProfile}
  <div class="player-profile">
    <Paper elevation={4}>
      <Player {...$players[$currentPlayer]} points={$players[$currentPlayer].points}/>
    </Paper>
  </div>
  {/if}

