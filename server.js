'use strict';
const http = require ('http');
const fs = require ('fs');
const qs = require('querystring');
const PORT = 3000;
let storedPages = [];
let blacklist = ['404.html', 'css', 'index.html'];
let generateListItems = (arr) => {

};

let writeIndex = () => {
  fs.readdir('public/', (err, file) => {
    if (err) {
      console.log(err);
    } else {
      createIndexListFile(file, (list) => {
        fs.writeFile('public/index.html', indexTemplate(list), (err) => {
          if(err){
            return console.log(err);
          }
        console.log('updated index');
        });
      });
    }
  });
};

let createIndexListFile = (list, callback) => {
  let newArr = [];
  list.filter((name) => {
    if(blacklist.indexOf(name) < 0){
      return name;
    }
  })
  .forEach((item) => {
      let capitalItem;
      item = item.split('.');
      item.pop();
      item = item.join('.');
      capitalItem = item[0].toUpperCase() + item.slice(1, item.length);
      item = `<li><a href="/${item}.html">${capitalItem}</a></li>`;
      newArr.push(item);
      return item;
  });
  return callback(newArr);
};


let indexTemplate = function(arr){
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
<h3>These are ${arr.length}</h3>
<ol>
${arr.join('\n')}
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
http.createServer((request, response) => {
  let headers = request.headers;
  let method = request.method;
  let urlRequested = request.url;
  let fileName = headers.filename;
  let type;
  let status;
  let bufferString;
  let parsedData;

  if(urlRequested === '/'){
    urlRequested = '/index.html';
    type = 'html';
  } else if(urlRequested === '/css/styles.css'){
    type = 'css';
  } else {
    type = 'html';
  }

  request.on('data', (data) => {
    bufferString = data.toString();
  });

  request.on('end', () => {
    parsedData = qs.parse(bufferString);
  });

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
    fs.readFile('public' + urlRequested, (err,file) => {
      if (err){
      fs.writeFile(`public/${parsedData.element.toLowerCase()}.html`, pageTemplate(parsedData.element.toLowerCase(), parsedData.atomicnumber, parsedData.description, parsedData.symbol ), (err) => {
        if(err){
          return console.log(err);
        }
        console.log(`${parsedData.element.toLowerCase()}.html was saved`);
          writeIndex();
      });
      } else {
        console.log('file already exists');
      }
      response.end();
    });
    break;

    case 'PUT':
      fs.readFile('public' + urlRequested, (err,file) => {
        if(err){
          console.log('file does not exist');
        } else {
          fs.writeFile(`public/${parsedData.element.toLowerCase()}.html`, pageTemplate(parsedData.element.toLowerCase(), parsedData.atomicnumber, parsedData.description, parsedData.symbol ), (err) => {
            if(err){
              return console.log(err);
            }
            console.log(`${parsedData.element.toLowerCase()}.html was edited`);
          });
        }
        response.end();
      });
    break;

    case 'DELETE':
      fs.readFile('public' + urlRequested, (err, file) => {
        if(err){
          console.log('file was not found');
        } else {
          fs.unlink('public' + urlRequested, (err) => {
            if(err){
              console.log('was unable to delete');
            }
            console.log('deleted ' + urlRequested);
              writeIndex();
          });
        }
        response.end();
      });
    break;

  }

}).listen(PORT);