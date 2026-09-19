import { styled } from 'styled-components';
import { Turn, dropRatio } from './Turn';

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
  font-variant-numeric: tabular-nums;
`;

const Entry = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0;
`;

const Drop = styled.span`
  margin-left: auto;
  opacity: 0.7;
`;

function dropLabel(turn: Turn): string {
  if (turn.roll === 1) {
    return '☠';
  }
  return `−${Math.round(dropRatio(turn) * 100)}%`;
}

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
        {entries.map((turn, i) => (
          <Entry key={history.length - 1 - i}>
            <span className={`badge badge-player-${turn.player}`}>P{turn.player}</span>
            <span>
              {turn.roll} / {turn.maxRoll}
            </span>
            <Drop>{dropLabel(turn)}</Drop>
          </Entry>
        ))}
      </Entries>
    </div>
  );
}
