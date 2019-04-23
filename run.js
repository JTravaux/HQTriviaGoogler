const HqClient = require('./lib/client');
const googleTab = require('./solvers/google-tab');
const results = require('./solvers/result-analysis');

async function run() {
    try {
        let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI0ODQ2MTY2LCJ1c2VybmFtZSI6Ikp0cmF2YXV4IiwiYXZhdGFyVXJsIjoiaHR0cHM6Ly9jZG4uaHkucGUvZGEvcmVkLnBuZyIsInRva2VuIjoiZHRRdHBwIiwicm9sZXMiOltdLCJjbGllbnQiOiJpT1MvMS40LjYgYjEzNCIsImd1ZXN0SWQiOm51bGwsInYiOjEsImlhdCI6MTU0OTIzODU0OCwiZXhwIjoxNTU3MDE0NTQ4LCJpc3MiOiJoeXBlcXVpei8xIn0.QfH7JpprJAzZ0wOYgl7gaj6G15GOVguudvyazvk0RB4';
        let hq = new HqClient(token);

        // Join the current game
        //hq.joinGame();

        // Event Handlers
        hq.on('question', numResultsAnalysis);
 
        await numResultsAnalysis({
            type: 'question',
            ts: '2019-04-19T01:05:23.102Z',
            totalTimeMs: 10000,
            timeLeftMs: 10000,
            questionId: 87080,
            question: 'What is the name of the tattoo on Little Pete\'s arm on “The Adventures of Pete & Pete”?',
            category: 'TV',
            answers:
            [{ answerId: 263527, text: 'Petunia' },
            { answerId: 263528, text: 'Post Malone' },
            { answerId: 263529, text: 'Pneumonia' }],
            questionNumber: 1,
            questionCount: 15,
            askTime: '2019-04-19T01:05:23.102Z',
            erase1: true,
            extraLifeEligible: true,
            questionMedia: null,
            sent: '2019-04-19T01:05:23.196Z',
            c: 17 })

    } catch (err) {
        console.log(err);
    }
}

numResultsAnalysis = question => {
    results.answer(question);
}

run();