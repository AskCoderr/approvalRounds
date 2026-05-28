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
            workspace: "Engineering Logistics",
            subject: "Procure High-Speed Camera Lenses",
            requestedBy: "Anand Narayan",
            date: "2026-05-26",
            timeAgo: "2 hours ago",
            status: "Pending"
        },
        {
            id: "appr-002",
            workspace: "Infrastructure & Cloud",
            subject: "Approve AWS VPC Terraform Deployment",
            requestedBy: "Meera Nair",
            date: "2026-05-26",
            timeAgo: "4 hours ago",
            status: "Pending"
        },
        {
            id: "appr-003",
            workspace: "Field Trials",
            subject: "Budget Approval for ESP32 Deterrent Nodes",
            requestedBy: "Siddharth Kumar",
            date: "2026-05-25",
            timeAgo: "1 day ago",
            status: "Pending"
        },
        {
            id: "appr-004",
            workspace: "Computer Vision Lab",
            subject: "Camera2 API Framework Integration Baseline",
            requestedBy: "Gautham Das",
            date: "2026-05-25",
            timeAgo: "1 day ago",
            status: "Pending"
        },
        {
            id: "appr-005",
            workspace: "Engineering Logistics",
            subject: "Roland Go Keys 3 Hardware Procurement",
            requestedBy: "Rohan Sharma",
            date: "2026-05-24",
            timeAgo: "2 days ago",
            status: "Pending"
        },
        {
            id: "appr-006",
            workspace: "Infrastructure & Cloud",
            subject: "Modify Subnet NACL Inbound Rules",
            requestedBy: "Deepa Ramachandran",
            date: "2026-05-24",
            timeAgo: "2 days ago",
            status: "Pending"
        },
        {
            id: "appr-007",
            workspace: "Research & DIP",
            subject: "Malpractice Detection Dataset Acquisition",
            requestedBy: "Dr. Lakshmi Prasad",
            date: "2026-05-23",
            timeAgo: "3 days ago",
            status: "Pending"
        },
        {
            id: "appr-008",
            workspace: "Field Trials",
            subject: "Ulayur Site Sensor Deployment Schedule",
            requestedBy: "Vignesh Prabhu",
            date: "2026-05-22",
            timeAgo: "4 days ago",
            status: "Pending"
        },
        {
            id: "appr-009",
            workspace: "Computer Vision Lab",
            subject: "Cricket Seam Tracking Calibration Assets",
            requestedBy: "Arjun Madhav",
            date: "2026-05-21",
            timeAgo: "5 days ago",
            status: "Pending"
        },
        {
            id: "appr-010",
            workspace: "Core Infrastructure",
            subject: "System Stability Feature Freeze Sign-off",
            requestedBy: "Hari Krishnan",
            date: "2026-05-20",
            timeAgo: "6 days ago",
            status: "Pending"
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
})

app.listen(PORT, () => {
    console.log(`node server running on http://localhost:${PORT}`);
});
