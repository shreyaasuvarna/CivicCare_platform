# CivicCare 
A full-stack civic complaint management platform that lets citizens report local issues and allows government admins to track, prioritize, and resolve them efficiently.

### Tech Stack
Frontend    : React 18, React Router v6, Axios\
Backend     : Node.js, Express.js\
Database    : MongoDB Atlas + Mongoose\
Auth        : JWT (JSON Web Tokens), bcryptjs\
File Upload : Multer


### Features 

#### For Citizens:
Register and log in securely with JWT authentication\
File complaints with title, description, location, category, and image upload\
View all public complaints with search, filter, and pagination\
Upvote/support complaints filed by others\
Track the status of your own complaints

#### For Government Admins:
Secure admin login with a dedicated dashboard\
View all complaints sorted by AI-based priority score and critical flags\
Update complaint status (Pending → In Progress → Resolved / Rejected)\
Add admin notes to complaints\
View platform statistics: total complaints, resolved, pending, active users\
Category-wise breakdown and recent activity metrics\
Government dashboard for a public-facing overview

#### Smart Priority Engine
Keyword-based critical detection (fire, gas leak, flood, collapse, etc.)\
Scores complaints based on urgency keywords + community support count + complaint age\
Marks high-danger complaints as isCritical for instant visibility\

