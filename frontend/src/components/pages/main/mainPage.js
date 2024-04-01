import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';

import useDataService from '../../../services/dataService';
import useCheckGameExists from '../../../services/checkGameExists';

import './mainPage.css';


const MainPage = () => {
    useCheckGameExists();
    const navigate = useNavigate();
    const { getGamesList, createGame, error } = useDataService();

    const [rooms, setRooms] = useState([]);
    const [roomName, setRoomName] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        getGamesList().then(data => {
            setRooms(data.games);
        });
    }, []);

    const redirectToGame = (game_id) => {
        navigate(`/online/${game_id}`)
    }

    const createRoom = (event) => {
        event.preventDefault();
        if (roomName.length < 2 || roomName.length > 25) {
            setIsValid(false);
            return;
        }
        createGame(roomName, isPublic, false).then(data => {
            const gameId = data.game_id;
            if (error === null) {
                redirectToGame(gameId);
            }
        });
    }

    return (
        <React.Fragment>
            <div className="main__info">
                <h1>Главная страница</h1>
                <p>Создайте свою комнату или присоединитесь к существующей.</p>
            </div>
            <div className="main__create">
                <Form className='main__form'>
                    <h3>Создание комнаты</h3>
                    <Form.Group className="mb-3 main__field" controlId="formBasicEmail">
                        <Form.Control type="text" placeholder="Введите название комнаты..." onChange={(event) => setRoomName(event.target.value)} />
                        <p className="invalid_message" style={
                            isValid ? { display: 'none' } : { display: 'block' }
                        }>Длина имени должна быть от 2 до 25 символов!</p>
                    </Form.Group>
                    <Form.Group className="mb-3 main__field" controlId="formBasicCheckbox">
                        <Form.Check type="checkbox" label="Публичная комната" onChange={event => { setIsPublic(event.target.checked) }} />
                        <Form.Text className="checkbox-text">Эту комнату увидят все игроки</Form.Text>
                    </Form.Group>
                    <Button className='main__button' variant="outline-secondary" onClick={createRoom} type="submit">
                        Создать
                    </Button>
                </Form>
            </div>
            <div className="main__list">
                <h3>Список доступных комнат</h3>
                <ListGroup className='main__list-items'>
                    {
                        rooms.length !== 0 ? rooms.map((room, index) => {
                            return (
                                <ListGroup.Item className="main__list-item" key={index}>
                                    <p>{room.game_name}</p>
                                    <Button className='list-item__button' variant="outline-secondary" onClick={() => { redirectToGame(room.game_id) }}>Присоединиться</Button>
                                </ListGroup.Item>
                            );
                        }) : <ListGroup.Item className="main__list-item null-games">Доступных игр нет</ListGroup.Item>

                    }
                </ListGroup>
            </div>
        </React.Fragment>
    );
}

export default MainPage;