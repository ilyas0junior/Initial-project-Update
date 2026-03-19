
​1. Project Overview
​Project Title: Implementation of a management and monitoring tool for National Partnerships.
​Organization: CNSS (National Social Security Fund), Morocco.
​Department: Directorate of Studies, Communication and Development / International Relations and Partnerships Department.
​Date: December 2025.
​Goal: To digitize, organize, and secure the lifecycle of partnership agreements, replacing reliance on emails and unstructured documents.
​2. Key Objectives
​The document outlines three main goals for this application:
​Facilitation: Improve monitoring and steering through clear, consolidated indicators.
​Traceability & Efficiency: Reduce email dependency, ensure a history of actions is kept, and structure the data.
​Security: Ensure secure and long-term archiving of signed conventions and documents.
​3. Functional Architecture
​The application is divided into several specific modules and interfaces:
​A. General Settings (Admin Level)
​Managed by a Functional Administrator, this module defines the reference data:
​Types, Nature, and Domains of partnerships (based on Annexes 1, 2, 3).
​List of external partners.
​Internal CNSS entities responsible (Central, DR, PUM, etc.).
​State Mapping:
​Request States: Consult, Modify, Cancel, Validate.
​Partnership States: Operational, Non-operational, To be renewed, Expired, In progress.
​B. Workflow & Processing Circuit
​The system must track the lifecycle of a partnership from creation to archiving.
​Key Actors & Roles:
​DP/Entities: Design and modification of the project.
​DCGD: Compliance opinion.
​DG (Director General): Signature.
​DAL: Organization of signing ceremonies.
​DAJSCA: Archiving of signed deliverables.
​DCRP: Publication on the intranet.
​Notifications: The system must trigger email notifications to relevant collaborators (e.g., alerting the DCRP when a signed convention is ready for publication).
​C. Management Modules (User Interfaces)
​Login: Secure access.
​Home Dashboard: tailored to user profiles, showing tasks in progress, alerts, and stats.
​Creation Interface: Inputting new projects, attaching draft conventions, listing stakeholders to be notified.
​Engagement Interface: Crucial Step. After signature, the responsible entity inputs specific commitments (engagements) for both parties, including frequencies and deployment dates.
​Modification & Validation: Allows editing of non-validated requests and changing the status of partnerships (e.g., switching from "Non-operational" to "Operational").
​Tracking (Suivi): A table allowing actions based on the current state (e.g., if "In Course," one can Consult, Modify, or Validate).
​D. Reporting & Dashboarding
​The tool requires robust data visualization and retrieval capabilities:
​Advanced Search: By keyword, partner, direction, date, etc.
​Audit Log: A detailed history of who did what and when.
​Dashboard: KPIs including:
​Number of partnerships (active, expired, to be renewed).
​Validation rates and average processing times.
​Export: Data must be exportable to Excel or PDF.
​E. Stock Management (Legacy Data)
​The system must allow the import ("injection") of existing/old partnerships to build the initial database.
​Alert System: Automated emails for partnerships nearing expiration to prompt renewal analysis.
​4. User Profiles & Access Control
​The document defines strict role-based access control (RBAC):
​Functional Administrator: Manages settings and reference tables.
​Entry Profile (Profil de saisie): Creates requests.
​Validation Profile: Validates requests.
​Consultation Profile: Read-only access for concerned entities.
​Modification Profile: Updates requests.
​5. Data Structure (Based on Annex 6)
​The "Situation de suivi" table gives us a glimpse of the required database schema. Key fields include:
​Partnership ID & Type (Framework Convention, Specific Protocol, Amendment).
​Nature & Domain.
​Partner Name & Title/Object of the partnership.
​Responsible Entity & Concerned Entity.
​Dates: Signature, Fiscal Year, Effective Date, End Date.
​Status (Operational, Expired, etc.).
​Summary of the Workflow Logic
​Drafting: User creates a request \rightarrow Uploads draft.
​Validation Loop: Circulates through DCGD/DAL/DG for approval and signature.
​Activation: Once signed, the status changes \rightarrow Dates and Engagements are entered.
​Monitoring: The system tracks "Engagements" (deliverables) and expiration dates.
​Alerting: System warns users when a contract is ending.
​Archiving: DAJSCA classifies the physical/digital proofs.
​Would you like me to draft a technical database schema (SQL) or a user flow diagram based on these specifications?
