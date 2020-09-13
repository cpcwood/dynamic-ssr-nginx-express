# Dynamic SSR Express

[![Code Style](https://badgen.net/badge/code%20style/airbnb/ff5a5f)](https://github.com/airbnb/javascript)

## Overview

Express webserver and Nginx filter to perform dynamic server side rendering (SSR) for Single Page Applications (SPAs), with the aim of improving SEO and SMO with minimal configuration.  

## Why & How

One of challenges of creating a production SPA, is providing effective Search Engine Optimization (SEO) and Social Media Optimization (SMO). The issue is, that in some frameworks, very little page content is served to the client in the initial response as it is filled in later via the client javascript application. Search engine and social media crawlers often rely on the initial response's page content and meta tags to provide their evaluation, and since many do no implement javascript yet, the crawler may not get the desired page content leading to poor SEO and SMO.  

To mitigate this issue, dynamic SSR is used to return a snapshot of the fully rendered page content in the initial response, but only to the selected crawlers. Using dynamic SSR provides a workaround for crawlers on sites which have rapidly changing javascript generated content, and reduces the server load compared to complete client SSR.

In this implementation, client requests are filtered for crawlers, using the User Agent Header, in the reverse proxy (nginx). Requests which are deemed as being from crawlers are then sent to the renderer which will either: 
- render the SPA using puppeteer headless chrome and return the resulting html snapshot
- return a previously cached render

Filtering crawlers in the reverse proxy provides separation of concerns for SSR and the option to run the renderer server on a different machine. There will also be no client application changes and client bundles can still be served using a CDN. 

## Tech Stack

Nginx
Express
Puppeteer

## Install & Configure

## Resources

https://developers.google.com/web/tools/puppeteer/articles/ssr

## Future Developments

- Permanent cache storage using Redis
