import { writable } from 'svelte/store';
export const count = writable(0);
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