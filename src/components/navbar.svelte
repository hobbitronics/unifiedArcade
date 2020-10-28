<script>
  import Player from './player.svelte'
  import Paper from '@smui/paper'
  import { goto } from '@sveltech/routify'
  import Menu from '@smui/menu'
  import Select, {Option} from '@smui/select'
  import List, {Item, Separator, Text, PrimaryText, SecondaryText, Graphic} from '@smui/list'
  import TopAppBar, {Row, Section, Title} from '@smui/top-app-bar'
  import IconButton from '@smui/icon-button'
  import Dialog, {Content, Actions} from '@smui/dialog'
  import Button, {Label} from '@smui/button'

  import { currPlayer, players, setCurrentPlayer } from '../playerService.js'

  let menu
  let options
  let dialog
  let showIcon = [false, false, false]
  let showProfile = false
  let showNoBtn
  let yesLabel
  let dialogContent
  let yesHandler
  let noHandler
  let playerChoice = ''
  $: if (playerChoice) {
    setCurrentPlayer(playerChoice)
    playerChoice = ''
  }

  const option1 = () => {
    showNoBtn = false
    yesLabel = 'ok'
    dialogContent='Unified Arcade App Version: Pre-alpha.'
    yesHandler = ''
    dialog.open()
  }
 
  const option = (content, iconNum) => {
    showNoBtn = true
    yesLabel = 'Yes'
    dialogContent = content
    yesHandler = () => showIcon[iconNum] = true
    noHandler = () => showIcon[iconNum] = false
    dialog.open()
  }

  const closeHandler = () => console.log("Thanks for playing.")
</script>

<style>

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
    max-width: 240px;
  }

  @media only screen and (max-width: 720px) {
    .player-profile {
      position: fixed;
      top: 72px;
      left: 74%;
      z-index: 9;
      max-width: 140px;
    }
  }  

</style>

<div class="appBar">
    <header class="mdc-top-app-bar">
        <div class="mdc-top-app-bar__row">
          <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <button on:click={() => menu.setOpen(true)} class="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button" aria-label="Open navigation menu">menu</button>
            <span class="mdc-top-app-bar__title">Hello {$currPlayer.name}, We come to Unified Arcade App</span>
            {#if showIcon[0]}<span class="material-icons" >thumb_up</span>{/if}
            {#if showIcon[1]}<span class="material-icons" >request_quote</span>{/if}
            {#if showIcon[2]}<span class="material-icons" >rowing</span>{/if}

          </section>
          <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
            <button on:click={() => showProfile = !showProfile} class="material-icons mdc-top-app-bar__action-item mdc-icon-button" aria-label="portrait"><img src={$currPlayer.picture} alt="portrait"/></button>
            <Select bind:value={playerChoice} label="switch player">
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
        <Item on:SMUI:action={option1}><Text>About</Text></Item>
        <Item on:SMUI:action={() => option('Like Unified Arcade App?', 0)}><Text>Like UAA?</Text></Item>
        <Item on:SMUI:action={() => option('Would you like to buy the licensed version?', 1)}><Text>Purchase</Text></Item>
        <Item on:SMUI:action={() => option('Want another icon to show up?', 2)}><Text>another icon?</Text></Item>
      </List>
    </Menu>
  </div>

  <Dialog
  bind:this={dialog}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  on:MDCDialog:closed={closeHandler}>
  <!-- <Title id="dialog-title">Delete Item</Title> -->
  <Content id="dialog-content">
    {dialogContent}
  </Content>
  <Actions>
    {#if showNoBtn}
    <Button on:click={noHandler}>
      <Label>No</Label>
    </Button>
    {/if}
    <Button on:click={yesHandler}>
      <Label>{yesLabel}</Label>
    </Button>
  </Actions>
</Dialog>

  {#if showProfile}
  <div class="player-profile">
    <Paper elevation={4}>
      <Player {...$currPlayer}/>
    </Paper>
  </div>
  {/if}

