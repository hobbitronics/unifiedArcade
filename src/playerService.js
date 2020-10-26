import { writable, readable, get, derived } from 'svelte/store';
// import { players, currentPlayer } from './components/stores.js'
export const players = writable(
    [
        {
            id: 1,
            name: 'Pinball Wizard',
            picture: 'https://i.imgur.com/O4QdclB.jpg',
            points: 101,
            bio: 'Bio: The best around'
        },
        {
            id: 2,
            name: 'Player',
            picture: 'https://i.imgur.com/kjxayZk.png',
            points: 0,
            bio: ''
        }
    ]);

export const currentPlayer = writable(1)

export const currPlayer = derived( [players, currentPlayer],
    ([$players, $currentPlayer]) => $players[$currentPlayer])
    
let player_index;
let players_value;
let currPlayer_val;

const subscribe_pv = players.subscribe(value => {
    players_value = value;
});

const subscribe_pi = currentPlayer.subscribe(value => {
    player_index = value;
});

const subscribe_po = currPlayer.subscribe(value => {
    currPlayer_val = value;
});
    
const setCurrentPlayer = aName => {
    currentPlayer.set( players_value.findIndex( player => player.name === aName));
    console.log('current Player:', currPlayer.name)
}

const appendPlayers = (name, picture, bio) => {
    let lastPlayer = players_value[players_value.length-1]
    players.update( n =>
        [...n, {
        id: lastPlayer.id + 1,
        name : name,
        picture: picture,
        points : 0,
        bio: bio
        }]
    )
    currentPlayer.set( players_value.length-1 )
}

const removePlayer = name => {
    if (currPlayer_val.name === name) currentPlayer.set(0);
    if (players_value.length-1) players.update( n => n.filter(player => player.name !== name));
};

const addPoint = () => players.update( n => { n[player_index].points += 1; return n} );
const minusPoint = () => players.update( n => {n[player_index].points -= 1; return n});
const resetPoints = () => players.update( n => {n[player_index].points = 0; return n});

export {player_index, players_value, currPlayer_val,  subscribe_pv, subscribe_pi, subscribe_po, setCurrentPlayer, removePlayer, appendPlayers, addPoint, minusPoint, resetPoints};