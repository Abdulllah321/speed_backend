import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// log directory path
const logDirectory = path.resolve(__dirname, '../../log');

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a write stream for access logs
const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });

export default {
    dev: morgan('dev'),
    combined: morgan('combined', { stream: accessLogStream })
}