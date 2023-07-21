import { Injectable } from '@nestjs/common';
const { JSDOM } = require('jsdom');
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async insertBaseIntoHead(htmlString: string, baseURL: string) {
    const dom = new JSDOM(htmlString);
    const document = dom.window.document;

    // Create a new <base> element and set its href attribute to the baseURL
    const baseElement = document.createElement('base');
    baseElement.setAttribute('href', baseURL);

    // Get the <head> element
    const headElement = document.querySelector('head');

    if (headElement) {
      // Insert the <base> element as the first child of the <head> element
      headElement.insertBefore(baseElement, headElement.firstChild);
    } else {
      // If <head> element doesn't exist, create one and add the <base> element to it
      const newHeadElement = document.createElement('head');
      newHeadElement.appendChild(baseElement);

      // Insert the new <head> element at the beginning of the <html> element
      const htmlElement = document.querySelector('html');
      if (htmlElement) {
        htmlElement.insertBefore(newHeadElement, htmlElement.firstChild);
      }
    }

    // Return the modified HTML string
    return dom.serialize();
  }

  async getWebsiteContent(url: any) {
    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for any dynamic content to load
    // You might need to customize this based on the website
    await page.waitForTimeout(2000);

    const htmlContent = await page.content();
    await browser.close();

    return htmlContent;
  }
}
