const RulesPage = () => {
    return (
        <>
            <h1 style={
                { marginTop: '20px' }
            }>Правила игры</h1>
            <p>Настольная игра "Сиджа" состоит из 2-х этапов: расстановки фигур и непосредственно самого игрового процесса.</p>
            <p>В начале игры в центре крестом стоят 2 белые и 2 черные фигуры. На этапе расстановки фигур игроки по очереди ставят фигуры на свободные клетки, кроме центральной. После того, как все клетки будут заполнены, начинается следующий этап.</p>
            <p>На этапе игры игроки, начиная с игрока белыми фигурами, по очереди ходят любой фигурой в любом направлении. Если после хода игрока оказалось так, что ряд фигур противоположного цвета(ряд длиной от 1 до 3 фигур) оказался зажатым между 2-мя фигурами цвета игрока, этот ряд фигур противника убирается с игровой доски.</p>
            <p>Игра заканчивается тогда, когда у какого-либо игрока остается 1 фигура или 0 фигур.</p>
        </>
    )
}

export default RulesPage;