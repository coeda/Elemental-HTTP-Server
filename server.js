'use strict';
const http = require ('http');
const fs = require ('fs');
const PORT = 3000;
let storedPages = ['<li><a href="/hydrogen.html">Hydrogen</a>','</li><li><a href="/helium.html">Helium</a></li>'];

http.createServer((request, response) => {
  console.log(request.url);
  let headers = request.headers;
  let method = request.method;
  let urlRequested = request.url;
  let fileName = headers.filename;
  let type;
  let status;

  let indexTemplate = function(){
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <h1>The Elements</h1>
  <h2>These are all the known elements.</h2>
  <h3>These are 2</h3>
  <ol>
  ${storedPages.join('\n')}
  </ol>
</body>
</html>`;
  };
  let pageTemplate = function(newElement, atomicNumber, description, symbol) {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>The Elements - ${newElement}</title>
    <link rel="stylesheet" href="css/styles.css">
  </head>
  <body>
    <h1>${newElement}</h1>
    <h2>${symbol}</h2>
    <h3>Atomic number ${atomicNumber}</h3>
    <p>${description}
    <p><a href="/">back</a></p>
  </body>
  </html>`;
  };

  if(urlRequested === '/'){
    console.log('hit')
    urlRequested = '/index.html';
    type = 'html';
  } else if(urlRequested === '/css/styles.css'){
    type = 'css';
  } else {
    type = 'html';
  }

  switch (method){
    case 'GET':
      fs.readFile('public' + urlRequested, (err,file) => {
        if (err){
          response.writeHead(404, {
            'status': 404,
            'content-type': 'text/' + type + '; charset=utf-8',
          });
          response.write(`<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>Element not found!</title>
              <link rel="stylesheet" href="css/styles.css">
            </head>
            <body>
              <h1>404</h1>
              <h2>Element not found!</h2>
              <p>
                <a href="/">back</a>
              </p>
            </body>
            </html>`
          );
          response.end();
        } else {
          response.writeHead(200, {
              'status': 200,
              'content-type': 'text/' + type + '; charset=utf-8',
          });
          response.write(file);
          response.end();
        }
      });
      break;
    case 'POST':
    let newPage;
      fs.writeFile(`public/${headers.element.toLowerCase()}.html`, pageTemplate(headers.element.toLowerCase(), headers.atomicnumber, headers.description, headers.symbol ), (err) => {
        if(err){
          return console.log(err);
        }
        console.log(`${headers.element.toLowerCase()}.html was saved`);
        newPage = `</li><li><a href="/${headers.element}.html">${headers.element}</a></li>`;
        storedPages.push(newPage);
        fs.writeFile('public/index.html', indexTemplate(), (err) => {
          if(err){
            return console.log(err);
          }
        });
        response.end();
      });
    break;
    case 'PUT':
      //do post stuff
    break;
  }






}).listen(PORT);