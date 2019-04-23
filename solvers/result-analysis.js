const Chromium = require('puppeteer');

let stop = ["typically", "what", "is", "a", "the"]

// Remove the stop words
removeStopWords = text => {
    let strs = text.split(" ");

    for (let i = 0; i < stop.length; ++i)
        if (strs.indexOf(stop[i]) > -1)
            strs = strs.filter(s => s !== stop[i])

    return strs.join(" ");
}

// Escape characters
escapeChars = text => {

    if (text.includes("“"))
        text = text.split("“").join("\"")

    if (text.includes("”"))
        text = text.split("”").join("\"")

    if (text.includes("’"))
        text = text.split("’").join("\'")

    return text;
}

// Google
searchGoogle = (q, answer, window) => {
    return new Promise(resolve => {
        window.newPage().then((tab) => {
            tab.goto('https://www.google.com/ncr').then(() => {
                tab.type('#tsf', q).then(() => {
                    tab.keyboard.press('Enter').then(() => {
                        tab.waitForNavigation().then(() => {
                            tab.$("#resultStats").then((el) => {
                                el.getProperty('textContent').then((js) => {
                                    js.jsonValue().then((x) => console.log(`Google: ${answer} => ${x}`))
                                    resolve(); // Resolve the number of results?
                                })
                            })
                            tab.$("#ires").then((el) => {
                                el.getProperty('textContent').then((js) => {
                                    js.jsonValue().then((x) => {
                                        if (x.startsWith('Featured snippet from the web')){
                                            console.log(`\x1b[32m***${answer} Contains Featured Snippet***\n\x1b[0m`)
                                            resolve(); // Resolve the number of results?
                                        }
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

// Bing
searchBing = (q, answer, window) => {
    return new Promise(resolve => {
        window.newPage().then((tab) => {
            tab.goto('https://www.bing.com').then(() => {
                tab.type('#sb_form_q', q).then(() => {
                    tab.keyboard.press('Enter').then(() => {
                        tab.waitForNavigation().then(() => {
                            tab.$("#b_tween").then((el) => {
                                if (!el) {
                                    console.log(`Bing: ${answer} => 0 results`)
                                    return;
                                }
                                el.getProperty('textContent').then((js) => {
                                    js.jsonValue().then((x) => console.log(`Bing: ${answer} => ${x.split(' ')[0]} results`))
                                    resolve();
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

exports.answer = async (question) => {
    let answers = question.answers;
    let q = removeStopWords(escapeChars(question.question.toLowerCase()));
    let window = await Chromium.launch({ headless: true, defaultViewport: null,  args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    // Loop through each of the answers...
    console.log(`\x1b[35m${q}\x1b[0m`);
    for (let i = 0; i < answers.length; i++) {
        searchBing(`${q} + "${answers[i].text}"`, answers[i].text, window);
        searchGoogle(`${q} + "${answers[i].text}"`, answers[i].text, window);
        console.log();  
    }

};