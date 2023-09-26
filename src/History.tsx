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
                        Rolled {round.roll} (out of {round.maxRoll})
                    </li>
                )}
            </ul>
        </div>
    );
}