const http = require('http');
const { promises: fs } = require('fs');
const { getUrlParams } = require('./functions');
const os = require('os');

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const { url, method } = req;
  res.statusCode = 200;
  res.setHeader('Content-type', 'text/html');

  let data;
  let lines;
  let urlData;

  if (method === 'GET') {
    urlData = getUrlParams(req);

    switch (urlData.url) {
      // Main web - Saying hello c:
      case '/':
        res.end(await fs.readFile('./public/welcome.html'));
        break;

      // List of books inside the txt file
      case '/books':
        await fs.writeFile('./public/tmp_books.html', await fs.readFile('./public/books.html'));

        data = await fs.readFile('./public/books.txt', 'UTF-8');
        lines = data.split(/\r?\n/);

        for (let i = 0; i < lines.length; i += 4) {
          await fs.appendFile('./public/tmp_books.html', `<h3>${lines[i]}</h3>`, (error) => { if (error) { console.log(error); } });
          await fs.appendFile('./public/tmp_books.html', `<p>${lines[i + 1]}</p>`, (error) => { if (error) { console.log(error); } });
          await fs.appendFile('./public/tmp_books.html', `<p>${lines[i + 2]}</p>`, (error) => { if (error) { console.log(error); } });
          await fs.appendFile('./public/tmp_books.html', '<br>', (error) => { if (error) { console.log(error); } });
        }

        res.end(await fs.readFile('./public/tmp_books.html'));
        break;

      // File viewer
      case '/file-viewer':
        if (Object.entries(urlData.params).length === 0) {
          res.end(await fs.readFile('./public/file-viewer.html'));
        }

        const { q } = urlData.params;

        if (typeof q === 'undefined') {
          res.end(await fs.readFile('./public/error.html'));
        }

        res.end(await fs.readFile(q));

        break;

      case '/server-status':
        const obj = {
          hostName: os.hostname(),
          cpu: os.cpus(),
          arch: os.arch(),
          upTime: os.uptime(),
          userInfo: os.userInfo(),
          freeMem: os.freemem()
        };

        const serverData = JSON.stringify(obj);

        fs.writeFile('./server-status.json', serverData, 'utf8', (err) => {
          if (err) {
            console.log(`Error writing file: ${err}`);
          } else {
            console.log('File is written successfully!');
          }
        });

        res.end(await fs.readFile('./server-status.json'));
        break;

      // If route doesn't exist
      default:
        res.end(await fs.readFile('./public/error.html'));
    }
  }

  if (method === 'POST') {
    let data = [];

    switch (url) {
      case '/books':
        req
          .on('data', d => {
            data.push(d);
          })
          .on('end', async () => {
            data = Buffer.concat(data).toString();
            res.statusCode = 201;

            const jsonData = JSON.parse(data);
            const dataInfo = Object.entries(jsonData);

            await fs.appendFile('./public/books.txt', '\n', (error) => { if (error) { console.log(error); } });

            dataInfo.forEach(async line => {
              await fs.appendFile('./public/books.txt', `${line[0]}: ${line[1]}\n`, (error) => { if (error) { console.log(error); } });
            });

            await fs.appendFile('./public/books.txt', '\n', (error) => { if (error) { console.log(error); } });

            res.end('Info successfully added');
          });
        break;
      default:
        res.end('Request failed');
    }
  }

  if (method === 'DELETE') {
    switch (url) {
      case '/books':
        fs.writeFile('./public/books.txt', '');
        res.end('Books list is now empty');
        break;
      default:
        res.end('Request failed');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
