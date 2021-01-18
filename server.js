const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

router.route('/create').post((req, res) => {
  console.log(req.body);
})

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log('Request received');
  res.send(`<!doctype html>
            <html><head><title>Testpage</title></head>
              <body><h1>Hello World!</h1></body>
            </html>`)})

app.use('/user', router);

app.listen(PORT, () => {
  console.log('Server is running on PORT:',PORT);
});
