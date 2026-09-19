import { styled } from "styled-components";
import { Turn } from "./Turn";

interface HistoryProps {
    history: Turn[];
}

// No card, no borders. Just a quiet label floating above a muted list.
const Label = styled.div`
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.5;
`;

const Entries = styled.ol`
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.875rem;
    opacity: 0.6;
`;

export default function History({ history }: HistoryProps) {
    if (history.length === 0) {
        return null;
    }

    // Newest first
    const entries = [...history].reverse();

    return (
        <div className="px-2">
            <Label className="mb-2">History</Label>
            <Entries>
                {entries.map((round, i) => (
                    <li className="py-1" key={history.length - 1 - i}>
                        <span className={`badge me-2 ${round.player === 1 ? "text-bg-warning" : "text-bg-info"}`}>
                            Player {round.player}
                        </span>
                        Rolled {round.roll} (out of {round.maxRoll})
                    </li>
                ))}
            </Entries>
        </div>
    );
}
