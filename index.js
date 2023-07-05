import express from 'express'
import multer from 'multer'
import cors from 'cors'
import colors from 'colors'
import path from 'path'
import http from 'http'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import sharp from 'sharp'




const app = express()
const server = http.createServer(app,
)

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],

    },
}))
dotenv.config()
const allowedOrigin = 'https://image-uploader-client-blush.vercel.app/'
app.use(cors({
    origin: '*'
}))


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

// to serve images inside public folder

app.use(express.static(path.join(__dirname, './public')))
console.log(__dirname)




////////  set a storage ////////

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, './public')
    }
    , filename: function (req, file, cb) {
        console.log(file)

        const uniqueFileName = `${Date.now()}-${uuidv4()}-${file.originalname}`
        cb(null, uniqueFileName)
    }


    ,
})
// to upload images
const upload = multer({
    storage: storage,

})

app.get('/', (req, res) => {
    res.send('hello server is runnig')
})

//// to upload single image
app.post('/single', upload.single('image'), (req, res, err) => {
    if (req.file) {
        console.log(req.file);
        res.send('ok');
    } else {
        res.status(400).send('image not found');
    }
});

//// delete file
app.delete('/single/:filename', (req, res) => {
    const imageName = req.params.filename;
    const imagePath = `./public/${imageName}`;

    // check if image exists

    if (fs.existsSync(imagePath)) {
        // remove image
        fs.unlinkSync(imagePath);
        res.send('Image deleted successfully.');
    } else {
        res.status(404).send('Image not found.');
    }
})

////////// load all files from the public folder
app.get('/public', (req, res) => {
    const publicFolderPath = path.join(__dirname, 'public');

    fs.readdir(publicFolderPath, (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('bad read request');
            return;
        }

        // process file
        const fileContents = [];
        files.forEach((file) => {
            const filePath = path.join(publicFolderPath, file);
            const data = fs.readFileSync(filePath);
            const content = data.toString('base64');
            fileContents.push({ fileName: file, content });
        });

        // Set cache control header
        res.setHeader('Cache-Control', 'public, max-age=31536000')

        // return file contents
        res.send(fileContents);
    });
})








const PORT = process.env.PORT

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`.yellow.bold)
})