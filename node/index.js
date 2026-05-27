import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// const requireAuth = (req, res, next) => {
//     const token = req.cookies.jwt;
    
//     if (!token) {
//         return res.redirect('/login');
//     }
    
//     next();
// };

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', {
        firstName: "Ashwin",
        lastName: "S Krishna",
        email: "askaskaskask@gmail.com",
        workspaces: ["Infosys", "UST Global", "TCS", "TCS", "TCS", "TCS", "TCS", "TCS", "TCS", "TCS", "TCS", "TCS", "TCS", "TCS", "TCS", "TCS", "TCS", "TCS"],
        pending: [0, 1, 20000, 1, 4, 0, 0, 0, 5, 0, 20000, 1, 4, 0, 0, 0, 5, 0]
    }); 
});

app.get('/workspace', (req, res) => {
    res.render('workspace', {
        firstName: "Ashwin",
        lastName: "S Krishna",
        email: "askaskaskask@gmail.com"
    });
})

app.listen(PORT, () => {
    console.log(`node server running on http://localhost:${PORT}`);
});
