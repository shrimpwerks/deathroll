import CHEAT_MESSAGES from './cheatMessages';

export type Player = 1 | 2;

export interface Turn {
    player: Player;
    roll: number;
    maxRoll: number;
    // Commentary on the roll, decided once when it lands.
    note: string | null;
};

export function nextMaxValue(rounds: Turn[]): number {
    if (rounds.length === 0) {
        throw new Error("Game has not started");
    }

    return rounds[rounds.length - 1].roll;
}

export function hasGameStarted(rounds: Turn[]): boolean {
    return rounds.length > 0;
}

export function isGameOver(rounds: Turn[]): boolean {
    if (rounds.length === 0) {
        return false;
    }

    return rounds[rounds.length - 1].roll === 1;
}

// How far the roll fell from the max, as 0..1. Rolling the max is 0, rolling 1 of 100 is 0.99.
export function dropRatio(turn: Turn): number {
    if (turn.maxRoll <= 0) {
        return 0;
    }

    return 1 - turn.roll / turn.maxRoll;
}

// `matchedPrevious` is true when the roll equals the previous player's roll.
// The first turn has no previous roll, so rolling the starting value doesn't count.
export function noteFor(roll: number, maxRoll: number, matchedPrevious: boolean): string | null {
    if (roll === 1) {
        return null; // the loser messages handle this one
    }

    if (roll === 2) {
        return "One away from death.";
    }

    if (matchedPrevious) {
        return CHEAT_MESSAGES[Math.floor(Math.random() * CHEAT_MESSAGES.length)];
    }

    return null;
}
