export type Player = 1 | 2;

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

export function callout(turn: Turn): string | null {
    if (turn.roll === 1) {
        return null; // the loser messages handle this one
    }

    if (turn.roll === 2) {
        return "One away from death.";
    }

    if (turn.roll === turn.maxRoll) {
        return "Zero progress. Coward.";
    }

    return null;
}
