export type Player = 1 | 2;

export function otherPlayer(player: Player): Player {
    return player === 1 ? 2 : 1;
}

export interface Turn {
    player: Player;
    roll: number;
    maxRoll: number;
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

// Rolling at least this fraction of the max, without hitting it, is a whole lot of nothing.
const NOTHING_HAPPENED_RATIO = 0.95;

// Losing at least this much of the max in one roll is worth a callout, and a screen shake.
export const BIG_DROP_RATIO = 0.9;

// `previous` is the same player's last turn, if any.
export function callout(turn: Turn, previous: Turn | null = null): string | null {
    if (turn.roll === 1) {
        return null; // the loser messages handle this one
    }

    if (turn.roll === 2) {
        return "One away from death.";
    }

    if (turn.roll === turn.maxRoll) {
        return "Zero progress. Coward.";
    }

    if (turn.roll >= turn.maxRoll * NOTHING_HAPPENED_RATIO) {
        return "Bold move. Nothing happened.";
    }

    if (dropRatio(turn) >= BIG_DROP_RATIO) {
        return `Dropped ${Math.round(dropRatio(turn) * 100)}%. Ouch.`;
    }

    if (turn.roll * 2 === turn.maxRoll) {
        return "Perfectly balanced.";
    }

    if (previous && previous.roll === turn.roll) {
        return "Déjà roll.";
    }

    return null;
}

// The turn this player took before `index`, if any.
export function previousTurnBy(rounds: Turn[], index: number): Turn | null {
    const player = rounds[index].player;
    for (let i = index - 1; i >= 0; i--) {
        if (rounds[i].player === player) {
            return rounds[i];
        }
    }
    return null;
}
