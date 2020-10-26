import { writable, derived } from 'svelte/store'
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
    ])

export const currentPlayerId = writable(2)

export const currPlayer = derived( [players, currentPlayerId],
    ([$players, $currentPlayerId]) => $players.find( player => player.id === $currentPlayerId ) )

let player_id
let players_value
let currPlayer_val

const subscribe_pv = players.subscribe( value => players_value = value )

const subscribe_pi = currentPlayerId.subscribe( value => player_id = value )

const subscribe_po = currPlayer.subscribe( value => currPlayer_val = value )

const findIndexById = id => players_value.findIndex(player => player.id === id)
    
const setCurrentPlayer = aName => {
    currentPlayerId.set( players_value.find( player => player.name === aName).id )
    console.log('current Player:', currPlayer_val.name)
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
    currentPlayerId.set( lastPlayer.id + 1 )
}

const removePlayer = name => {
    if (currPlayer_val.name === name) return
    if (players_value.length-1) players.update ( n => n.filter(player => player.name !== name) )
}

const addPoint = () => players.update( n => { n[findIndexById(player_id)].points += 1; return n} );
const minusPoint = () => players.update( n => {n[findIndexById(player_id)].points -= 1; return n});
const resetPoints = () => players.update( n => {n[findIndexById(player_id)].points = 0; return n});

export { setCurrentPlayer, removePlayer, appendPlayers, addPoint, minusPoint, resetPoints}