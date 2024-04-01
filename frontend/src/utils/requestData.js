import colors from "../models/Colors";
import gameStages from "../models/GameStage";

const colorsDict = {
    "white": colors.white,
    "black": colors.black,
    "without": null,
}

const gameStagesDict = {
    "waiting": gameStages.waiting,
    "arrangement": gameStages.arrangement,
    "game": gameStages.play,
    "end": gameStages.finish,
}

const gameStagesToStr = {
    [gameStages.waiting]: "waiting",
    [gameStages.arrangement]: "arrangement",
    [gameStages.play]: "game",
    [gameStages.finish]: "end",
}

const ColorsToStr = {
    [colors.white]: "white",
    [colors.black]: "black",
    [null]: "without",
}

const russianGameStagesToStr = {
    [gameStages.waiting]: "Ожидание противника",
    [gameStages.arrangement]: "Расстановка фигур",
    [gameStages.play]: "Игра",
    [gameStages.finish]: "Игра окончена",
}

const russianColorsToStr = {
    [colors.white]: "Белыми",
    [colors.black]: "Черными",
    [null]: "?",
}

export default { colorsDict, gameStagesDict, gameStagesToStr, ColorsToStr, russianGameStagesToStr, russianColorsToStr };
