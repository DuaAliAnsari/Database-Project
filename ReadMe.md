**Hospital Management System**

The final code is in the working_product branch.

**Contributors**: Dua Ali Ansari, Tahera Abidi, Maryam Binte Shahid 
________________________________________
**Overview**

The Hospital Management System (HMS) is a centralized application designed to streamline patient care, appointment scheduling, medical record management, and billing in modern healthcare facilities. It provides role-based access for doctors and administrators, ensuring accurate and secure handling of patient data.
The system addresses challenges like:

•	Lost or incomplete patient records

•	Scheduling conflicts and overbooking

•	Delayed access to medical history and lab results

•	Billing discrepancies and poor departmental coordination
________________________________________
**Features**

**Patient Management**
•	Add, view, and search patients

•	Track appointments and visit history

•	Maintain detailed medical histories including allergies, surgeries, vaccinations, and family history

**Doctor Management**

•	Add and update doctor information

•	Schedule appointments with availability constraints

•	View patient records and visit history

**Appointment Management**

•	Create, update, and cancel appointments

•	Ensure doctors are not overbooked (max 20 per day)

•	Track appointment status: Scheduled, Completed, Cancelled, No-Show

**Visit Records & Prescriptions**

•	Record visit details: symptoms, diagnosis, treatment notes, vitals

•	Doctors can create prescriptions with dosage, frequency, duration, and instructions

**Billing**

•	Create, update, and view bills

•	Track payment status: Paid, Pending, Overdue, Cancelled

•	Support multiple payment methods including cash, card, insurance, and online

**Authentication & Roles**

•	Role-based login for doctors and administrators

•	Secure password management and unique usernames
________________________________________
**Database Design**

•	Entities: Doctors, Patients, Medical History, Appointments, Visit Records, Prescriptions, Billing, User Authentication

•	Relationships:

o	One-to-many: Doctor ↔ Appointments, Patient ↔ Appointments, Patient ↔ Visit Records, Doctor ↔ Prescriptions

o	One-to-one: Patient ↔ Medical History, Appointment ↔ Billing (optional), Appointment ↔ Visit Record (optional)

•	Normalization: Database normalized to 3rd Normal Form (3NF) ensuring data integrity and eliminating redundancy
________________________________________
**Tech Stack**

•	Frontend: HTML, CSS, JavaScript

•	Backend & Database: SQL
________________________________________
**Application Flow**

1.	Login Page: Authenticates users and redirects to the relevant dashboard

2.	Admin Dashboard: Manage appointments, patients, doctors, and billing

3.	Doctor Dashboard: Manage appointments, patients, visit records, and medical history

4.	Appointment Workflow: Create → View → Update → Track status
5.	Billing Workflow: Generate bills → Update → Check pending payments

