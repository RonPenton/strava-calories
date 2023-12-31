import 'dotenv/config';
import ClientOAuth2 from 'client-oauth2';
import express from 'express';
import fetch from 'node-fetch';

import qs from 'qs';
import fs from 'fs';

const stravaAuth = new ClientOAuth2({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    accessTokenUri: 'https://www.strava.com/oauth/token',
    authorizationUri: 'https://www.strava.com/oauth/authorize',
    redirectUri: 'http://localhost:8112/callback', // replace with your callback URL
    scopes: ['read_all,activity:read,activity:read_all'] // replace with the scopes you need
});

const app = express();
const port = 8112;

app.get('/', (_req, res) => {
    const uri = stravaAuth.code.getUri({ state: 'some state' });
    res.redirect(uri);
});

app.get('/callback', (req, res) => {
    //const code = req.query.code as string;
    stravaAuth.code.getToken(req.originalUrl, {
        body: {
            action: 'requesttoken',
            client_id: String(process.env.CLIENT_ID),
            client_secret: String(process.env.CLIENT_SECRET),
        }
    })
        .then(async function (user) {
            console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... }

            const data = await getPages(user.accessToken, 2023);

            const rides = data.filter(x => x.type == 'Ride');
            fs.writeFileSync('rides.json', JSON.stringify(rides, null, 4));

            res.send(rides).end();

        })
        .catch(err => {

            res.send(err.message + err.stack);
        });
});

async function getPages(accessToken: string, year: number) {
    let page = 1;
    let data: any[] = [];
    do {
        const d = await getPage(accessToken, year, page);
        if(d.length === 0) {
            break;
        }
        data = data.concat(d);
        page++;
    } while(true);
    return data;
}

async function getPage(accessToken: string, year: number, page: number) {
    const before = new Date(year, 11, 31).getTime() / 1000;
    const after = new Date(year, 0, 1).getTime() / 1000;
    const url = `https://www.strava.com/api/v3/athlete/activities?before=${before}&after=${after}&page=${page}&per_page=100`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    if(!Array.isArray(data)) {
        throw new Error('Not an array');
    }

    return data;
}

app.get('/loggedin', async (req, res) => {
    res.send('You are logged in, I think!');
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
