import { useParams } from "react-router-dom";
import { Link } from 'react-router-dom';

import "./gameExistsPage.css";

const GameExistsPage = () => {
    const { gameId } = useParams();
    return (
        <>
            <div className="game-exists__main">
                <h1>Вы уже находитесь в игре</h1>
                <p>Вы сможете продолжить играть другие партии после того, как закончите текущую</p>
                <Link to={`/online/${gameId}`} className="game-exists__button btn btn-outline-secondary">Присоединиться</Link>
            </div>
        </>
    );
}

export default GameExistsPage;