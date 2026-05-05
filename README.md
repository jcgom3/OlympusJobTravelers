# Olympus Job Travelers

Olympus Job Travelers is a prototype web application for viewing job travelers with selected production sections translated from English to Spanish for sewing production teams.

This MVP currently uses local static TypeScript data instead of email intake, PDF parsing, database storage, or OpenAI API translation. The purpose of this version is to demonstrate the user experience and core display workflow before adding automation.

## Current MVP Functionality

The current React + TypeScript MVP supports:

- Active Orders and Past Orders
- Search by order number, customer, or job name
- Job traveler detail page
- English job header information
- Side-by-side English and Spanish production sections
- Required bilingual section labels:
  - Art Information / Información de Arte
  - Main Comments / Comentarios Principales
  - Additional Comments / Comentarios Adicionales
  - Packing / Shipping Comments / Comentarios de Empaque y Envío
- Print-friendly view
- Local data source from `src/data/jobTravelers.ts`

## Planned Full Product Functionality

The planned production system will process job travelers automatically from a company email address.

### Intended Workflow

1. A job traveler file is emailed to a designated company email address.
2. The application reads new email messages from that inbox.
3. The system downloads the job traveler file and any related attachments.
4. The source file is stored for future reference.
5. The application extracts only the required sections:
   - Art Information
   - Main Comments
   - Additional Comments
   - Packing / Shipping Comments
6. The extracted sections are passed through a company-approved glossary.
7. OpenAI API translates the selected sections into Spanish.
8. The translated sections are saved with the original English text.
9. Employees can view Active Orders and Past Orders from a website.
10. Users can search by order number and print if needed.

### Planned Architecture

```text
Company Email Inbox
        ↓
Node.js / TypeScript Email Worker
        ↓
Download Job Traveler + Attachments
        ↓
Extract Text / Parse Sections
        ↓
Apply Glossary Rules
        ↓
OpenAI API Translation
        ↓
Store English + Spanish Sections
        ↓
React / TypeScript Website
        ↓
Active Orders / Past Orders / Print View
```
