import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import colors from 'colors';

import { initDatabase } from './repositories/index.js';
import API from './api/index.js';
import { logRequest } from './Utils/index.js';

dotenv.config();
const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
    logRequest(req, res, next);
}, API);
initDatabase();

app.listen(PORT, (err) => {
    if (!err) {
        console.log("listening on port".blue, PORT);
    }
});
