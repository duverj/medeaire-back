const express = require('express');
const cors = require('cors');
const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://www.elcolombiano.com/contaminacion-en-medellin/index.html';
const app = express();
let response = {
    error: false,
    code: 200,
    message: '',
};

const corsOptions = {
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.listen(4000, () => {
    console.log("El servidor está inicializado en el puerto 4000");
});

app.get('/air', function (req, res) {
    rp(url)
    .then((html) => {
        response = {
            error: false,
            code: 200,
            message: getAirQualityValues(html),
        }
        res.send(response);
    })
    .catch((e) => {
        res.send(e);
        console.log(e)
    });
    
});

const getAirQualityValues = (html, airStation = '') => {
    const data = [];
    const scripts = $('script', html).get()[2].children[0].data;
    const splitted = scripts.split(',');
    data.push(getAirStations(parseFirstStation(splitted[0])))

    for (let i = 1; i < splitted.length; i++) {
        data.push(getAirStations(splitted[i]))
    }
    return data;
}

const parseFirstStation = (row) => {
    const splitted = row.split('{');
    return splitted[1];
}

const getAirStations = (row) => {
    const parsedRow = {};
    const splitted = row.split(':');
    const STATION_NAMES = {
        universidadNacional: 'Universidad Nacional',
        museoDeAntioquia: 'Museo de Antioquia',
        tanquesLaYe: 'Tanques La Y EPM',
        casaJusticia: 'Casa de la Justicia - Itagüí',
        concejoItagui: 'I.E. Consejo Itagüí',
        lasallistaCaldas: 'Lasallista Caldas',
        metroEstrella: 'Metro La Estrella',
        sosNorte: 'S.O.S Norte - Girardota',
    }
    parsedRow.station = splitted[0].trim();
    parsedRow.name = STATION_NAMES[parsedRow.station];
    parsedRow.score = parseInt(splitted[1].replace(/"/g, ""));
    return parsedRow;
}