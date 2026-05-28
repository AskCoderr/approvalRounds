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
    const pendingApprovals = [
        {
            title: "Q3 Budget Review",
            timeAgo: "2 hours ago",
            subject: "Approve marketing department financial allocation.",
            createdBy: "Sarah Jenkins"
        },
        {
            title: "AWS Cloud Migration",
            timeAgo: "1 day ago",
            subject: "Authorize staging environment infrastructure upgrades.",
            createdBy: "David Chen"
        },
        {
            title: "Design System V2",
            timeAgo: "3 days ago",
            subject: "Sign off on updated component typography.",
            createdBy: "Elena Rostova"
        },
        {
            title: "Security Patch 4.1",
            timeAgo: "5 days ago",
            subject: "Deploy emergency hotfix for dependency vulnerabilities.",
            createdBy: "Marcus Vance"
        },
        {
            title: "Client Portal Redesign",
            timeAgo: "1 week ago",
            subject: "Review final frontend user experience wireframes.",
            createdBy: "Jessica Taylor"
        },
        {
            title: "API Gateway Key",
            timeAgo: "1 week ago",
            subject: "Renew production third party credential access.",
            createdBy: "Aman Gupta"
        },
        {
            title: "Marketing Video Assets",
            timeAgo: "2 weeks ago",
            subject: "Release promo materials for social campaigns.",
            createdBy: "Chloe Leblanc"
        },
        {
            title: "Database Indexing Update",
            timeAgo: "2 weeks ago",
            subject: "Optimize queries for faster workspace retrieval.",
            createdBy: "Siddharth Nair"
        },
        {
            title: "Employee Handbook v3",
            timeAgo: "3 weeks ago",
            subject: "Verify remote work compliance policy guidelines.",
            createdBy: "Karen Thompson"
        },
        {
            title: "Hardware Upgrade Request",
            timeAgo: "1 month ago",
            subject: "Procure development laptops for incoming engineers.",
            createdBy: "Oliver Bennett"
        }
    ];

    res.render('workspace', {
        firstName: "Ashwin",
        lastName: "S Krishna",
        email: "askaskaskask@gmail.com",
        roles: ['admin'],
        pendingApprovals: pendingApprovals
    });
})

app.listen(PORT, () => {
    console.log(`node server running on http://localhost:${PORT}`);
});
