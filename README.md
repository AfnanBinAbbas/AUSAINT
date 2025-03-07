# Open-Source OSINT Tool for Investigators

## Team ASUA
**Team Members:**
- Muhammad Umar Maqsood
- Shamina Durrani
- Afnan bin Abbas
- Aqib Shakeel

## Project Overview
This project aims to develop a free and secure **Open-Source Intelligence (OSINT) Investigative Suite** as an alternative to premium tools like Shodan and Maltego. The tool will allow investigators, cybersecurity professionals, and researchers to gather intelligence from publicly available sources securely.

## Features
- **Social Media Intelligence (SOCMINT)**: Profile lookup, leaked credentials detection
- **IP & Domain Intelligence**: WHOIS lookup, geolocation, DNS analysis
- **Dark Web Monitoring**: Hidden service searches (Tor)
- **Email & Phone OSINT**: Breach checks, data validation
- **Web Scraping for OSINT**: Detect exposed files, subdomains
- **Secure Reporting**: Export data as structured reports

## Technology Stack
- **Frontend**: HTML, CSS, JavaScript (React.js)
- **Backend**: Flask (Python-based API service)
- **Database**: PostgreSQL (secure data storage)
- **OSINT Modules**: Open-source tools (Sherlock, Twint, Sublist3r, WHOIS, etc.)

## Security Features
- **Secure Authentication & Role-Based Access Control**
- **Input Validation & API Rate Limiting**
- **Logging & Anomaly Detection**
- **Encrypted Data Storage**
- **Vulnerability Testing & Secure Coding Practices**

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- Python 3.x
- PostgreSQL
- Flask & Required Python Libraries
- Node.js (for frontend)

### Clone the Repository
```sh
git clone https://github.com/your-repo/osint-tool.git
cd osint-tool
```

### Backend Setup
```sh
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```sh
cd frontend
npm install
npm start
```

## Milestones & Deliverables
| Week | Deliverable |
|------|------------|
| 1 | Project Proposal, Security Planning, GitHub Repository Setup |
| 2 | Threat Modeling & Risk Assessment |
| 3 | System Architecture & Secure Design Diagrams |
| 4-6 | Secure Coding & Initial Feature Implementation |
| 7 | Security Testing, Vulnerability Analysis |
| 8 | Secure Code Review, Final Security Enhancements |
| 9 | Final Report, Source Code, Live Demo & Presentation |

## Contribution Guidelines
- Fork the repository and create feature branches.
- Follow best practices for secure coding.
- Submit pull requests for review.