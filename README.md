# Dynamic SSR Express

## Overview

Express webserver and Nginx filter to perform dynamic server side rendering (SSR) for Single Page Applications (SPAs), with the aim of improving SEO and SMO with minimal configuration.  

## Why & How

Since SSR is commonly used to provide SEO and SMO, dynamic SSR can be used to only perform SSR crawlers.

In this implementation, client requests are filtered for crawlers, using the User Agent Header, in the reverse proxy (nginx). Requests which are deemed as being from crawlers are then sent to the renderer which will either: 
- render the SPA using puppeteer headless chrome and return the resulting html snapshot
- return a previously cached render

Filtering crawlers in the reverse proxy provides separation of concerns for SSR and the option to run the renderer server on a different machine. There will also be no client application changes and client bundles can still be served using a CDN. 

## Tech Stack

Nginx
Express
Puppeteer

## Install & Configure


## Future Developments

- Permanent cache storage using Redis