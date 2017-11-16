const soap = require('soap');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3265;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sedo', (request, response) => {
  const result = [];
  const { domain: keyword } = request.body;
  // if (domain.includes('.')) {
  //   const i = domain.search(/\./);
  //   tld = domain.slice(i + 1);
  //   keyword = domain.slice(0, i);
  // } else {
  //   throw new Error('Use dot period!');
  // }
  const data = {
    searchquery: {
      keyword,
      kwtype: 'c',
      // tld: 'com',
      // language: 'en',
      // no_hyphen: false,
      // no_numeral: false,
      // no_idn: false,
      // resultsize: 2,
      partnerid: '320301',
      signkey: '6c900e39273dcca0b519452896316a',
    },
  };
  soap.createClientAsync('https://api.sedo.com/api/sedointerface.php?wsdl').then(client => {
    return client['DomainSearch'](data, (e, { return: { item: items } }) => {
      if (e) {
        response.json({ status: false, error: e.message });
      } else {
        if (items) {
          for (const { domain: { $value: domain }, price: { $value: price }, currency: { $value: currency }, rank: { $value: rank }, url: { $value: url }} of items) {
            result.push({ price, currency, domain, rank, url });
          };
        }
        if (!result) {
          response.status(400).json({ status: false, error: 'Try another domain' });
        } else {
          response.json({ status: true, result });
        }
      }
    });
  }).catch(e => response.status(400).json({ status: false, error: e.message }));
});

app.use((error, request, response, next) => {
  if (error.name === 'UnauthorizedError') {
    response.status(401).json({ message: error.message });
  }
});

app.use((error, request, response, next) => {
  console.error(error.stack);
  return response.status(error.status || 500)
    .json({ message_error: error.errors, message: 'internal' });
});

app.listen(port, () => console.log(`Please use localhost:${port}`));

module.exports = app;
