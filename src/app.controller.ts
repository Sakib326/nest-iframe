import { Controller, Get, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';
import parse from 'node-html-parser';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ccc')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/web')
  async getWebsiteContent(@Query('url') url: string, @Res() res) {
    try {
      console.log({ url });

      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        },
      });
      const htmlContent = await this.appService.insertBaseIntoHead(
        response?.data,
        url,
      );

      // const htmlContent = response.data;

      const root = parse(htmlContent, {
        lowerCaseTagName: false,
        comment: false,
      });

      function getBaseURL(fullURL) {
        const regex = /^(https?:\/\/[^\/]+)/i;
        const matches = fullURL.match(regex);
        return matches ? matches[1] : null;
      }
      const baseurlLink = `http://localhost:3000/web/?url=${getBaseURL(url)}`;
      const slashUrl = 'http://localhost:3000/web/?url=https:';

      const headLinks = root.querySelectorAll('link');
      headLinks.forEach((link) => {
        const src = link.getAttribute('href');
        if (src && !src.startsWith('http')) {
          if (src.startsWith('//')) {
            link.setAttribute('href', `https:${src}`);
          } else {
            link.setAttribute('href', getBaseURL(url) + src);
          }
        }
      });
      const scripts = root.querySelectorAll('script');
      scripts.forEach((script) => {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http')) {
          if (src.startsWith('//')) {
            script.setAttribute('src', `https:${src}`);
          } else {
            script.setAttribute('src', getBaseURL(url) + src);
          }
        }
      });

      const hrefLink = root.querySelectorAll('a');

      const link = 'http://localhost:3000/web/?url=';

      hrefLink.forEach((url) => {
        const src = url.getAttribute('href');
        if (src && !src.startsWith('https')) {
          if (src.startsWith('//')) {
            url.setAttribute('href', slashUrl + src);
          } else {
            url.setAttribute('href', baseurlLink + src);
          }
        } else {
          url.setAttribute('href', link + src);
        }
      });

      // Skip embedding iframe elements
      const iframes = root.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        iframe.remove();
      });

      // Remove elements with ad-specific classes (e.g., "ad", "advertisement", etc.)
      const adClassNames = [
        'ad',
        'advertisement',
        'ad-box',
        'ad-banner',
        'layout-with-rail__end',
        'ad-slot-header__wrapper',
        'layout-with-rail__rail',
      ];
      adClassNames.forEach((className) => {
        const adElements = root.querySelectorAll('.' + className);
        adElements.forEach((element) => {
          element.remove();
        });
      });
      res.send(root.toString());
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}
