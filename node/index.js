import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import session from 'express-session';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if deploying with HTTPS
}));

const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.accessToken) {
        return res.redirect('/auth/login');
    }
    next();
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/auth/login', (req, res) => {
    const loginUrl = `https://${process.env.COGNITO_DOMAIN}/login?client_id=${process.env.COGNITO_CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=${process.env.COGNITO_REDIRECT_URI}`;
    res.redirect(loginUrl);
});

app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) return res.status(400).send('No authorization code provided');

    try {
        const credentials = Buffer.from(`${process.env.COGNITO_CLIENT_ID}:${process.env.COGNITO_CLIENT_SECRET}`).toString('base64');

        const tokenResponse = await axios.post(`https://${process.env.COGNITO_DOMAIN}/oauth2/token`, 
            new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.COGNITO_CLIENT_ID,
                code: code,
                redirect_uri: process.env.COGNITO_REDIRECT_URI
            }).toString(), {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, id_token } = tokenResponse.data;
        const decodedUser = jwtDecode(id_token);

        req.session.accessToken = access_token;
        req.session.idToken = id_token;
        req.session.user = {
            email: decodedUser.email,
            firstName: decodedUser.given_name,
            lastName: decodedUser.family_name
        };

        res.redirect('/');
    } catch (error) {
        console.error('Token Exchange Failed:', error.response ? error.response.data : error.message);
        res.status(500).send('Authentication failed');
    }
});

app.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect(`https://${process.env.COGNITO_DOMAIN}/logout?client_id=${process.env.COGNITO_CLIENT_ID}&logout_uri=http://localhost:3000`);
});

app.use(requireAuth);

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
            id: "appr-001",
            title: "Engineering Logistics",
            subject: "Procure High-Speed Camera Lenses",
            author: "Anand Narayan",
            date: "2026-05-26",
            timeAgo: "2 hours ago"
        },
        {
            id: "appr-002",
            title: "Infrastructure & Cloud",
            subject: "Approve AWS VPC Terraform Deployment",
            author: "Meera Nair",
            date: "2026-05-26",
            timeAgo: "4 hours ago"
        },
        {
            id: "appr-003",
            title: "Field Trials",
            subject: "Budget Approval for ESP32 Deterrent Nodes",
            author: "Siddharth Kumar",
            date: "2026-05-25",
            timeAgo: "1 day ago"
        },
        {
            id: "appr-004",
            title: "Computer Vision Lab",
            subject: "Camera2 API Framework Integration Baseline",
            author: "Gautham Das",
            date: "2026-05-25",
            timeAgo: "1 day ago"
        },
        {
            id: "appr-005",
            title: "Engineering Logistics",
            subject: "Roland Go Keys 3 Hardware Procurement",
            author: "Rohan Sharma",
            date: "2026-05-24",
            timeAgo: "2 days ago"
        },
        {
            id: "appr-006",
            title: "Infrastructure & Cloud",
            subject: "Modify Subnet NACL Inbound Rules",
            author: "Deepa Ramachandran",
            date: "2026-05-24",
            timeAgo: "2 days ago"
        },
        {
            id: "appr-007",
            title: "Research & DIP",
            subject: "Malpractice Detection Dataset Acquisition",
            author: "Dr. Lakshmi Prasad",
            date: "2026-05-23",
            timeAgo: "3 days ago"
        },
        {
            id: "appr-008",
            title: "Field Trials",
            subject: "Ulayur Site Sensor Deployment Schedule",
            author: "Vignesh Prabhu",
            date: "2026-05-22",
            timeAgo: "4 days ago"
        },
        {
            id: "appr-009",
            title: "Computer Vision Lab",
            subject: "Cricket Seam Tracking Calibration Assets",
            author: "Arjun Madhav",
            date: "2026-05-21",
            timeAgo: "5 days ago"
        },
        {
            id: "appr-010",
            title: "Core Infrastructure",
            subject: "System Stability Feature Freeze Sign-off",
            author: "Hari Krishnan",
            date: "2026-05-20",
            timeAgo: "6 days ago"
        }
    ];

    res.render('workspace', {
        firstName: "Ashwin",
        lastName: "S Krishna",
        email: "askaskaskask@gmail.com",
        roles: ['admin'],
        pendingApprovals: pendingApprovals
    });
});

app.get('/workspace/:id', (req, res) => {
    const id = req.params.id;

    // collect approval id data from database

    const approvalData = {
        id: id,
        title: "Engineering Procurement Request",
        subject: "Procure High-Speed Camera Lenses for Seam Tracking",
        initiatedBy: "Anand Narayan",
        body: "Requesting budget clearance for the procurement of high-speed optical lenses required for real-time computer vision analysis and cricket ball seam tracking modules.",
        attachmentLinks: [
            "https://storage.internal/docs/lens_specifications.pdf",
            "https://storage.internal/quotes/vendor_pricing_v2.xlsx"
        ],
        comments: [
            {
                author: "Siddharth Kumar",
                content: "Verified core specifications. Lens focal length aligns with the ESP32-CAM frame field parameters."
            },
            {
                author: "Meera Nair",
                content: "Please attach the secondary vendor quotation string before final allocation approval."
            }
        ]
    };

    res.json(approvalData);
});

app.get('/rounds', (req, res) => {
    const approvalRounds = [
        { id: 1, name: "Engineering Procurement Request", author: "You", status: "pending", createdAt: "2026-05-28" },
        { id: 2, name: "Marketing Budget Allocation Q2", author: "Sarah Mitchell", status: "approved", createdAt: "2026-05-27" },
        { id: 3, name: "Cloud Infrastructure Upgrade", author: "You", status: "approved", createdAt: "2026-05-25" },
        { id: 4, name: "New Vendor Onboarding - TechSupply Co.", author: "Rahul Menon", status: "pending", createdAt: "2026-05-24" },
        { id: 5, name: "Office Renovation Phase 2", author: "You", status: "pending", createdAt: "2026-05-22" },
        { id: 6, name: "HR Policy Amendment - Remote Work", author: "Priya Nair", status: "approved", createdAt: "2026-05-20" },
        { id: 7, name: "Software License Renewal - Adobe Suite", author: "James Carter", status: "rejected", createdAt: "2026-05-18" },
        { id: 8, name: "Research Grant Application - AI Division", author: "You", status: "pending", createdAt: "2026-05-17" },
        { id: 9, name: "Annual Travel Budget Approval", author: "Meera Sharma", status: "approved", createdAt: "2026-05-15" },
        { id: 10, name: "Cybersecurity Audit Contract", author: "You", status: "approved", createdAt: "2026-05-12" },
        { id: 11, name: "Product Launch Campaign Funding", author: "Daniel Okafor", status: "pending", createdAt: "2026-05-10" },
        { id: 12, name: "Equipment Lease - Manufacturing Unit 3", author: "You", status: "pending", createdAt: "2026-05-08" },
        { id: 13, name: "Legal Retainer Fee Approval", author: "Aisha Fernandez", status: "rejected", createdAt: "2026-05-05" },
        { id: 14, name: "Intern Hiring Budget - Summer 2026", author: "You", status: "approved", createdAt: "2026-05-03" },
        { id: 15, name: "Data Center Expansion Proposal", author: "Kevin Tran", status: "pending", createdAt: "2026-05-01" },
    ]

    res.render('rounds', {
        firstName: "Ashwin",
        lastName: "S Krishna",
        email: "askaskaskask@gmail.com",
        roles: ['admin'],
        approvalRounds: approvalRounds
    });
});

app.get('/rounds/:id', (req, res) => {
    const id = req.params.id;

    // fetch data from database

    const response = {
        id: 1,
        roundName: 'Trial Round',
        levels: [
            {
                id: 1,
                status: 'rejected',
                type: 'parallel',
                nodes: [
                    { id: 1, userName: 'hazel yajn', firstName: 'hazel', userMail: 'hazelyaa@gmail.com', date: '2026-05-10', status: 'approved' },
                    { id: 2, userName: 'Rohan Mehta', firstName: 'Rohan', userMail: 'rohanm@gmail.com', date: '2026-05-10', status: 'rejected' },
                    { id: 3, userName: 'Priya Nair', firstName: 'Priya', userMail: 'priyanair@gmail.com', date: null, status: 'pending' },
                    { id: 4, userName: 'James Carter', firstName: 'James', userMail: 'jamesc@gmail.com', date: null, status: 'pending' },
                    { id: 5, userName: 'Aisha Fernandez', firstName: 'Aisha', userMail: 'aishaf@gmail.com', date: null, status: 'pending' },
                ],
                currPos: 2
            },
            {
                id: 2,
                status: 'pending',
                type: 'series',
                nodes: [
                    { id: 6, userName: 'Liam Torres', firstName: 'Liam', userMail: 'liamt@gmail.com', date: '2026-05-10', status: 'approved' },
                    { id: 7, userName: 'Meera Sharma', firstName: 'Meera', userMail: 'meeras@gmail.com', date: null, status: 'pending' },
                    { id: 8, userName: 'David Okafor', firstName: 'David', userMail: 'davido@gmail.com', date: null, status: 'pending' },
                ],
                currPos: 1
            },
            {
                id: 3,
                status: 'approved',
                type: 'parallel',
                nodes: [
                    { id: 9, userName: 'Sophie Lin', firstName: 'Sophie', userMail: 'sophiel@gmail.com', date: '2026-05-10', status: 'approved' },
                    { id: 10, userName: 'Kevin Tran', firstName: 'Kevin', userMail: 'kevint@gmail.com', date: '2026-05-11', status: 'approved' },
                    { id: 11, userName: 'Nina Patel', firstName: 'Nina', userMail: 'ninap@gmail.com', date: '2026-05-12', status: 'approved' },
                ],
                currPos: null
            },
            {
                id: 4,
                status: 'rejected',
                type: 'series',
                nodes: [
                    { id: 12, userName: 'Carlos Reyes', firstName: 'Carlos', userMail: 'carlosr@gmail.com', date: '2026-05-10', status: 'approved' },
                    { id: 13, userName: 'Fatima Al-Hassan', firstName: 'Fatima', userMail: 'fatimah@gmail.com', date: null, status: 'pending' },
                    { id: 14, userName: 'Ethan Brooks', firstName: 'Ethan', userMail: 'ethanb@gmail.com', date: '2026-05-10', status: 'rejected' },
                    { id: 15, userName: 'Yuki Tanaka', firstName: 'Yuki', userMail: 'yukit@gmail.com', date: null, status: 'pending' },
                ],
                currPos: null
            },
            {
                id: 5,
                status: 'rejected',
                type: 'parallel',
                nodes: [
                    { id: 16, userName: 'Grace Owusu', firstName: 'Grace', userMail: 'graceo@gmail.com', date: '2026-04-28', status: 'rejected' },
                    { id: 17, userName: 'Marco Bianchi', firstName: 'Marco', userMail: 'marcob@gmail.com', date: '2026-04-29', status: 'approved' },
                ],
                currPos: 2
            },
            {
                id: 6,
                status: 'rejected',
                type: 'series',
                nodes: [
                    { id: 18, userName: 'Ananya Krishnan', firstName: 'Ananya', userMail: 'ananyak@gmail.com', date: '2026-05-10', status: 'approved' },
                    { id: 19, userName: 'Tyler Morgan', firstName: 'Tyler', userMail: 'tylerm@gmail.com', date: '2026-05-10', status: 'approved' },
                    { id: 20, userName: 'Zara Ahmed', firstName: 'Zara', userMail: 'zarae@gmail.com', date: '2026-05-10', status: 'approved' },
                    { id: 21, userName: 'Ben Howell', firstName: 'Ben', userMail: 'benh@gmail.com', date: null, status: 'pending' },
                    { id: 22, userName: 'Clara Dubois', firstName: 'Clara', userMail: 'clarad@gmail.com', date: '2026-05-10', status: 'rejected' },
                ],
                currPos: 3
            }
        ]
    };
    res.json(response);
});

app.get('/users', (req, res) => {
    res.render('users.ejs', {
        firstName: "Ashwin",
        lastName: "S Krishna",
        email: "askaskaskask@gmail.com",
        roles: ['admin'],
        users: [
        {
            "id": 1,
            "firstName": "Ashwin",
            "userName": "Ashwin Kumar",
            "email": "ashwin.kumar@example.com",
            "roles": ["admin", "approvalCreator"]
        },
        {
            "id": 2,
            "firstName": "Rahul",
            "userName": "Rahul Sharma",
            "email": "rahul.sharma@example.com",
            "roles": ["editRoles", "removeUser"]
        },
        {
            "id": 3,
            "firstName": "Priya",
            "userName": "Priya Nair",
            "email": "priya.nair@example.com",
            "roles": ["addUser", "approvalCreator"]
        },
        {
            "id": 4,
            "firstName": "Kiran",
            "userName": "Kiran Mehta",
            "email": "kiran.mehta@example.com",
            "roles": ["admin", "removeUser", "addUser"]
        },
        {
            "id": 5,
            "firstName": "Sneha",
            "userName": "Sneha Reddy",
            "email": "sneha.reddy@example.com",
            "roles": ["approvalCreator", "editRoles"]
        },
        {
            "id": 6,
            "firstName": "Arjun",
            "userName": "Arjun Pillai",
            "email": "arjun.pillai@example.com",
            "roles": ["admin"]
        },
        {
            "id": 7,
            "firstName": "Divya",
            "userName": "Divya Menon",
            "email": "divya.menon@example.com",
            "roles": ["removeUser", "addUser"]
        },
        {
            "id": 8,
            "firstName": "Vikram",
            "userName": "Vikram Singh",
            "email": "vikram.singh@example.com",
            "roles": ["editRoles", "approvalCreator", "admin"]
        },
        {
            "id": 9,
            "firstName": "Ananya",
            "userName": "Ananya Iyer",
            "email": "ananya.iyer@example.com",
            "roles": ["addUser"]
        },
        {
            "id": 10,
            "firstName": "Rohan",
            "userName": "Rohan Verma",
            "email": "rohan.verma@example.com",
            "roles": ["approvalCreator", "removeUser"]
        },
        {
            "id": 11,
            "firstName": "Meera",
            "userName": "Meera Krishnan",
            "email": "meera.krishnan@example.com",
            "roles": ["admin", "editRoles", "addUser"]
        },
        {
            "id": 12,
            "firstName": "Aditya",
            "userName": "Aditya Bose",
            "email": "aditya.bose@example.com",
            "roles": ["approvalCreator"]
        },
        {
            "id": 13,
            "firstName": "Lakshmi",
            "userName": "Lakshmi Subramaniam",
            "email": "lakshmi.subramaniam@example.com",
            "roles": ["removeUser", "editRoles"]
        },
        {
            "id": 14,
            "firstName": "Nikhil",
            "userName": "Nikhil Joshi",
            "email": "nikhil.joshi@example.com",
            "roles": ["admin", "addUser"]
        },
        {
            "id": 15,
            "firstName": "Kavya",
            "userName": "Kavya Patel",
            "email": "kavya.patel@example.com",
            "roles": ["approvalCreator", "editRoles", "removeUser"]
        },
        {
            "id": 16,
            "firstName": "Suresh",
            "userName": "Suresh Babu",
            "email": "suresh.babu@example.com",
            "roles": ["addUser", "admin"]
        },
        {
            "id": 17,
            "firstName": "Pooja",
            "userName": "Pooja Desai",
            "email": "pooja.desai@example.com",
            "roles": ["editRoles"]
        },
        {
            "id": 18,
            "firstName": "Harish",
            "userName": "Harish Nambiar",
            "email": "harish.nambiar@example.com",
            "roles": ["removeUser", "approvalCreator", "addUser"]
        },
        {
            "id": 19,
            "firstName": "Deepa",
            "userName": "Deepa Rajan",
            "email": "deepa.rajan@example.com",
            "roles": ["admin", "approvalCreator", "editRoles"]
        },
        {
            "id": 20,
            "firstName": "Manoj",
            "userName": "Manoj Tiwari",
            "email": "manoj.tiwari@example.com",
            "roles": ["addUser", "removeUser"]
        }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`node server running on http://localhost:${PORT}`);
});
