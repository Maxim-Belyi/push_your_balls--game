export const canvas = document.getElementById("canvas1");
export const ctx = canvas.getContext("2d");
export const playerGameScore = document.getElementById("player-score-value");
export const hatchlingsLost = document.getElementById("enemy-score-value");
export const playerHatchlings = parseInt(playerGameScore.innerText);
export const enemyHatchlings = parseInt(hatchlingsLost.innerText);
export const numberOfObstacles = 8;
export let maxNumberOfEggs = 7;
export let eggsAppearanceInterval = 2000;
export let numberOfEnemies = 4;
export const gameFps = 30;
