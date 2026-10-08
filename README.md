# CPDO Record Management System

Office record system for the City Planning and Development Office. The screens follow the login, dashboard, daily document log, and file library previews.

- Front end: React
- Back end: Laravel
- Database: MySQL (this computer, or another computer on the LAN)

## Sign in

- Username: `admin`
- Password: `admin123`

Change the password from Account after the first sign-in.

## Start the system

1. Make sure MySQL is running and `backend/.env` points at it.
2. From this folder, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-CPDO.ps1
```

3. On this computer, open http://localhost:5173
4. On another computer on the same LAN, open `http://<this-computer-ip>:5173`

## LAN database

`backend/.env` is the database connection:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cpdo_rms
DB_USERNAME=cpdo
DB_PASSWORD=cpdo123
```

- `127.0.0.1` means MySQL is on this same computer.
- If MySQL is on another office computer, change `DB_HOST` to that computer's LAN IP, for example `192.168.1.20`.
- The MySQL user must be allowed to connect from this computer, and port 3306 must be open on the database computer.

The included database setup listens on the LAN so other office computers can use the same records. Database login for that server:

- User: `cpdo`
- Password: `cpdo123`
- Database: `cpdo_rms`

## What each screen does

- **Sign in** — username or email, show/hide password, remember me, and password reset for this LAN server.
- **Dashboard** — the five most recent recorded dates, plus the seven most recently uploaded files. Open a date for every record logged that day. New adds a document log. Search looks through records and files. Older recorded dates are on Documents.
- **Daily log** — open a date card. Export downloads an Excel file. Edit changes the rows. The pencil opens one record. New adds a record for that date.
- **Documents** — the full history of the same recorded dates shown on the Dashboard, grouped by the day they were recorded. Filter by month and year, then open a day. Upload is not on this page.
- **Files** — the PDF library. Upload, open, and delete PDF files here.
- **Account** — profile, password change, and sign out.
