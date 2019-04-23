const EventEmitter = require('events').EventEmitter;
const axios = require('axios');
const util = require('./util');
const websocket = require('ws');

const log = util.log;

module.exports = class HqClient extends EventEmitter {
    constructor(token) {
        super();
        this.token = token;
        this.headers = {
            Authorization: `Bearer ${this.token}`,
            Connection: 'Keep-Alive',
            'User-Agent': 'HQ-iOS/144 CFNetwork/975.0.3 Darwin/18.2.0',
            'x-hq-client': 'iOS/1.4.13 b144',
            'x-hq-deviceclass': 'phone',
        };
    }

    getMe() {return this.get(`https://ws-quiz.hype.space/users/me`);}
    getGame() {return this.get(`https://ws-quiz.hype.space/shows/now?type=hq`, { headers: { Authorization: null } });}

    async joinGame() {
        let game = await this.getGame();

        // Join a game
        if (!game.active) {
            log('No live game right now.\nNext game is', game.nextShowVertical.toUpperCase(), 'on', (new Date(game.nextShowTime)).toString());
            return;
        }

        // Connect to the websocket URL
        await this.connectWs(game.broadcast.socketUrl);
    }

    // Handle broadcast 'message'
    async handleMessage(message) {
        let ignore = ['interaction', 'broadcastStats', 'broadcastEnded', 'questionClosed', 'questionFinished', 'gameSummary', 'kicked', 'iapProductsCallout'];
        
        // Ignore specific message types
        if (ignore.includes(message.type))
            return;

        // When a question is asked...
        if (message.type === 'question') 
            this.emit('question', message);

        // Log known and unknown message types
        log(message);
    }

    // Connect to the websocket
    async connectWs(url, options = {}) {
        options = {
            headers: this.headers,
            ...options
        }

        // Setup the websocket
        let ws = new websocket(url, options);
        ws.on('open', () => log('Connected to game.'));
        ws.on('error', (err) => log('Error', err));
        ws.on('message', (data) => this.handleMessage(JSON.parse(data)));
        ws.on('close', async (code, reason) => {
            log('Socket closed. Reconnecting...', code, reason);
            await util.sleep(10);
            return this.connectWs(url, options);
        });
        return ws;
    }

    get(url, config = {}) { 
        return this.request(url, { ...config, method: 'GET' }); 
    }
    
    // Create Axios request
    async request(url, config = {}) {
        config = { ...config, headers: { ...this.headers, ...config.headers } };
        try {
            return (await axios.request(url, config)).data;
        } 
        catch (err) {
            log(err.response); 
            throw new Error(err.response);
        }
    }
}
