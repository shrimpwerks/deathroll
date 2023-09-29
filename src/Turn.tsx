// class Round {
//   turns: Turn[] = [];
// }

export interface Turn {
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