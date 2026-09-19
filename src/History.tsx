import { Turn } from "./Turn";

interface HistoryProps {
    history: Turn[];
}

export default function History({ history }: HistoryProps) {
    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title mb-0">History</h5>
            </div>
            <ul className="list-group list-group-flush">
                {history.map((round, i) =>
                    <li className="list-group-item" key={i}>
                        <span className={`badge me-2 ${round.player === 1 ? "text-bg-warning" : "text-bg-info"}`}>
                            Player {round.player}
                        </span>
                        Rolled {round.roll} (out of {round.maxRoll})
                    </li>
                )}
            </ul>
        </div>
    );
}