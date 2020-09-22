# Dynamic SSR Nginx Express

[![Code Style](https://badgen.net/badge/code%20style/airbnb/ff5a5f)](https://github.com/airbnb/javascript)

## Overview

Express.js webserver and Nginx filter to perform dynamic server side rendering (SSR) for Single Page Applications (SPAs), with the aim of improving SEO and SMO with minimal configuration to the current application.  

## Why & How

One of challenges of creating a production SPA, is providing effective Search Engine Optimization (SEO) and Social Media Optimization (SMO). The issue is, that in some frameworks, very little page content is served to the client in the initial response as it is filled in later via the client javascript application. Search engine and social media crawlers often rely on the initial response's page content and meta tags to provide their evaluation, and since many do no implement javascript yet, the crawler may not get the desired page content leading to poor SEO and SMO.  

To mitigate this issue, dynamic SSR is used to return a snapshot of the fully rendered page content in the initial response, but only to the selected crawlers. Using dynamic SSR provides a workaround for crawlers on sites which have rapidly changing javascript generated content, and reduces the server load compared to complete client SSR.

In this implementation, client requests are filtered for crawlers in the reverse proxy (nginx) using the User Agent Header. Requests which are deemed as being from crawlers are then sent to the renderer which will either: 
- render the SPA using puppeteer headless chrome and return the resulting html snapshot
- return a previously cached render

Filtering crawlers in the reverse proxy provides separation of concerns for SSR and the option to run the renderer server on a different machine. There will also be very little client application changes and client bundles can still be served using a CDN.

## Tech Stack

- [Nginx](https://www.nginx.com/)
- [Express.js](https://expressjs.com/)
- [Puppeteer](https://developers.google.com/web/tools/puppeteer)

Developed on Ubuntu 18.04.5

## Install & Configure

Clone or download repository and move to root directory

#### Install dependencies:
- Ensure [NodeJS](https://nodejs.org/en/) is installed and updated to current lts version (v12.18.4 at time of writing)
- Ensure [Yarn](https://yarnpkg.com/) installed, [npm](https://www.npmjs.com/get-npm) can also be used with equivalent commands
- Install application dependencies ```yarn install```

#### Configure application environment:
- Copy environment variables template and fill with application server details ```cp .env.template .env```

#### Create service to run the SSR server with minimal downtime:
- create systemd service or similar from the example ```example-systemd.service```
- save service file to ```/etc/systemd/system/dynamic-ssr.service```
- enable and start service:  
```sh
sudo systemctl daemon-reload
sudo systemctl enable dynamic-ssr.service
sudo systemctl start dynamic-ssr.service
```
- check the status of the service:
```sh
sudo systemctl status dynamic-ssr.service
```

#### Setup Nginx:
- Integrate configuration from ```example-nginx.conf``` to existing Nginx reverse proxy site configuration (default: ```/etc/nginx/sites-available/default```) in order to redirect requests from bots to the SSR server
- Reload systemd and restart Nginx:
```sh
sudo systemctl daemon-reload
sudo systemctl restart nginx
```

## Extra notes

Some notes which I found useful during setup:
- Ensure permissions on application build directory and files allow for Nginx access, so static files can be served using the ```try_files``` directive, without hitting the application server
- Nginx debugging mode is useful for checking where requests are routed to and if static files are served directly. Enable by adding ```error_log <path-to-log-file> debug;``` in the nginx site configuration
- Express uses the ```DEBUG``` environment variable to define level of server logging. To debug the SSR server, add ```Environment=DEBUG=*``` to the systemd service configuration and reload and restart the service. Unless defined systemd will output logs to ```/var/log/syslog```
- Currently the renderer blocks outgoing requests to Google Analytics services via the block list on line 26 ```components/renderer.js```. Edit the blocklist array to match your application requirements.
- By default the SSR server listens on localhost:5001, this can be changed in the ```.env``` file but make sure to also change the Nginx ```proxy_pass``` directive to match
- System NodeJS can be a different version to user, which may cause errors with [Puppeteer](https://developers.google.com/web/tools/puppeteer), check the version the root user has access to and make sure it is up to date
- Since the SSR server will be making AJAX requests in headless chrome, make sure to enable CORS on the application server else requests may be rejected


## Future Developments

- Permanent cache storage using Redis
- Dockerize
- Provide configuration for use with Apache Reverse Proxy

## Team

[Chris Wood](https://cpcwood.com)

Feel free to contribute if you have any improvements. 

## Resources

https://developers.google.com/web/tools/puppeteer/articles/ssr

## License

MIT
