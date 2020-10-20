<script>
    import { players} from './stores.js';
    import TopAppBar, {Row, Section, Title, FixedAdjust, DenseFixedAdjust, ProminentFixedAdjust, ShortFixedAdjust} from '@smui/top-app-bar';
    // import IconButton from '@smui/icon-button';
    // import Paper from '@smui/paper';
    // import Button from '@smui/button';
    import { goto } from '@sveltech/routify';
    import Menu from '@smui/menu';
    import List, {Item, Separator, Text, PrimaryText, SecondaryText, Graphic} from '@smui/list';
    
    let menu;
    let options;
</script>

<style>
    a {
        color: darkblue;
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

</style>

<div class="appBar">
    <header class="mdc-top-app-bar">
        <div class="mdc-top-app-bar__row">
          <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <button on:click={() => menu.setOpen(true)} class="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button" aria-label="Open navigation menu">menu</button>
            <span class="mdc-top-app-bar__title">Hello {$players[$players.length-1].name}, Welcome to Unified Arcade App</span>
          </section>
          <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
            <button class="material-icons mdc-top-app-bar__action-item mdc-icon-button" aria-label="Favorite">add</button>
            <button class="material-icons mdc-top-app-bar__action-item mdc-icon-button" aria-label="Search">search</button>
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

