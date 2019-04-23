const opener = require("opener");
const Q = 'https://www.google.com/search?q=';

exports.answer = question => {
    let answers = question.answers;
    for (let i = 0; i < answers.length; i++) {
        opener(`${Q}${question.question} "${answers[i].text}"`)
    }
};
