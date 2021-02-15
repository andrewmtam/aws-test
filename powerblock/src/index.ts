import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';

const buttonClass = 'bundle_add_to_cart_button';

const url = 'https://powerblock.com/product/pro-series-expandable/';
// const url = 'https://powerblock.com/product/sport-series/';
const logFile = 'time.json';

puppeteer.launch().then(async (browser) => {
    const page = await browser.newPage();
    await page.goto(url);

    try {
        // Look for the add-to-cart button
        await page.waitForSelector(`.${buttonClass}`, { timeout: 5000 });
    } catch (e) {
        // If we didn't find the button, clear the date!
        fs.writeFileSync(logFile, JSON.stringify({ lastFound: null }));
        await browser.close();
        return;
    }

    // Read the existing log file to see when we last sent a message
    const { lastFound } = JSON.parse(fs.readFileSync(logFile, 'utf8'));

    // Only send a message every hour if it is in stock
    if (lastFound && new Date().getTime() - lastFound < 1000 * 60 * 60) {
        await browser.close();
        return;
    }

    // Post message to the API
    try {
        await axios.post('https://api.pushover.net/1/messages.json', {
            // TODO: Fill this in on the server
            token: '',
            user: 'un26e3shgspkck8c3msjtvn4vcwrh7',
            title: 'In stock',
            message: url,
        });
    } catch (e) {
        console.error(e);
    }

    // Record what time it is now
    fs.writeFileSync(logFile, JSON.stringify({ lastFound: new Date().getTime() }));

    await browser.close();
});
