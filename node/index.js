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

    const response ={roundName:'Trial Round', levels:[
        {status:false, 
        nodes:[
            { userName: 'hazel yajn', userMail:'hazelyaa@gmail.com', date: '2026-05-10' },
            { userName: 'Rohan Mehta', userMail: 'rohanm@gmail.com', date: '2026-05-10' },
            { userName: 'Priya Nair', userMail: 'priyanair@gmail.com', date: null },
            { userName: 'James Carter', userMail: 'jamesc@gmail.com', date: null },
            { userName: 'Aisha Fernandez', userMail: 'aishaf@gmail.com', date: null },
        ],
        currPos:2},
        { status: false, 
        nodes: [
            { userName: 'Liam Torres', userMail: 'liamt@gmail.com', date: '2026-05-10' },
            { userName: 'Meera Sharma', userMail: 'meeras@gmail.com', date: null },
            { userName: 'David Okafor', userMail: 'davido@gmail.com', date: null },
        ], 
        currPos: 1 },

        { status: true, 
        nodes: [
            { userName: 'Sophie Lin', userMail: 'sophiel@gmail.com', date: '2026-05-10' },
            { userName: 'Kevin Tran', userMail: 'kevint@gmail.com', date: '2026-05-11' },
            { userName: 'Nina Patel', userMail: 'ninap@gmail.com', date: '2026-05-12' },
        ], 
        currPos: null },

        { status: false, 
        nodes: [
            { userName: 'Carlos Reyes', userMail: 'carlosr@gmail.com', date: '2026-05-10' },
            { userName: 'Fatima Al-Hassan', userMail: 'fatimah@gmail.com', date: null },
            { userName: 'Ethan Brooks', userMail: 'ethanb@gmail.com', date: '2026-05-10' },
            { userName: 'Yuki Tanaka', userMail: 'yukit@gmail.com', date: null },
        ], 
        currPos: null },

        { status: true, 
        nodes: [
            { userName: 'Grace Owusu', userMail: 'graceo@gmail.com', date: '2026-04-28' },
            { userName: 'Marco Bianchi', userMail: 'marcob@gmail.com', date: '2026-04-29' },
        ], 
        currPos: 2 },

        { status: false, 
        nodes: [
            { userName: 'Ananya Krishnan', userMail: 'ananyak@gmail.com', date: '2026-05-10' },
            { userName: 'Tyler Morgan', userMail: 'tylerm@gmail.com', date: '2026-05-10' },
            { userName: 'Zara Ahmed', userMail: 'zarae@gmail.com', date: '2026-05-10' },
            { userName: 'Ben Howell', userMail: 'benh@gmail.com', date: null },
            { userName: 'Clara Dubois', userMail: 'clarad@gmail.com', date: null },
        ], 
        currPos: 3 }
    ]};

    res.json(response);
})

app.listen(PORT, () => {
    console.log(`node server running on http://localhost:${PORT}`);
});
