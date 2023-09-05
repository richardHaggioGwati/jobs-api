require('dotenv').config();
require('express-async-errors');
const express = require('express');
const authenticateUser = require('./middleware/authentication')
const app = express();

// extra security packages
const helmat = require('helmet')
const cors = require("cors")
const xss = require('xss-clean')
const expressLimit = require("express-rate-limit")

// connect to db
const connectDb = require('./db/connect')

app.get('/', (req, res) => {
    res.send('Jobs api')
})

// routers
const authRouter = require('./routes/auth')
const jobRouter = require('./routes/jobs')

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1)
app.use(
    expressLimit({
      windowMs: 15 * 60 * 1000, // minutes
      max: 100, // Limit each IP to 100 request per windowMs
    })
)
app.use(express.json());
// extra packages
app.use(helmat())
app.use(cors())
app.use(xss())

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobRouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}....`)
    );
  } catch (error) {
    console.log(error);
  }
};

start().then();
