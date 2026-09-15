import { writable } from 'svelte/store';

// true, solange ein Audio läuft; AbortLink blendet sich dann aus.
export const audioActive = writable(false);
