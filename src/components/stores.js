import { writable } from 'svelte/store';
export const count = writable(0);
export const players = writable(
[
    {
        id: 1,
        name: 'Pinball Wizard',
        picture: 'https://i.imgur.com/O4QdclB.jpg',
        points: 101,
        bio: ''
    },
    {
        id: 2,
        name: 'Current Player',
        picture: '',
        points: 0,
        bio: ''
    }
]);