# Business admin

The new Laravel / Filament panel lives at `/manage`. Sign in with your existing administrator email and password. Website content and media remain at `/admin`, linked from the new panel.

## Start here

1. Open **Business settings** and edit the existing row. Enter your legal business name, billing address, email, business status, relevant identifiers, payment instructions, and tax treatment. Defaults are French documents and MAD; EUR/USD and English are also available. Issuing is blocked until identity and tax treatment are configured. No VAT rate is assumed.
2. Review **Service catalogue**. Existing website services are imported once as starting entries. Check each price, currency, billing period, deliverables, exclusions, and included revisions. Catalogue pricing is separate from public website marketing prices.
3. Complete and review **Contract templates**, then mark appropriate templates approved. The initial French/English entries are unapproved drafting prompts. Changing a template does not rewrite existing contracts.
4. Add a client with whichever details are available; no client fields or billing address are required. Create a quote, select services or enter custom lines, and preview its PDF. Save before opening the PDF or issuing.

## Sales workflow

**Website enquiry → client → quote → accepted quote → contract / invoice → payment**

- Enquiries record the service, business type, budget, timeline, and contact information from the public form. Set status, follow-up date, and internal notes; convert an enquiry to a client.
- A service selection copies its deliverables, exclusions, revisions, and price into the draft. Later catalogue changes leave the copied line items intact.
- Enter quantities with up to three decimal places and unit prices / fixed discounts with up to two. Calculations use integer minor units, with half-up rounding per line and for tax.
- Separate one-time, monthly, and yearly charges into different documents. Recurring documents describe the period; this version does not automatically bill subscriptions.
- Use the row's **Workflow** menu to issue a quote. Issuing assigns a permanent sequential number and locks contents. New quotes and invoices use a separate daily counter per type in Africa/Casablanca: `N°8092025/1` means the first document issued on 08/09/2025, followed by `/2`. Existing issued numbers are preserved. Contracts and credit notes retain annual `CTR` and `AV` numbering. Drafts show no official number.
- Record client acceptance after receiving it, then generate contract and invoice drafts from that accepted quote. Choose an approved contract template and complete its terms. Service scope appears alongside terms in the PDF.
- Record a signed contract after receiving the signed agreement. This is a manual record, not an electronic signature service.
- For a deposit invoice, reduce the generated draft's lines to the agreed deposit amount. Create the final invoice from the accepted quote and adjust it to the remaining amount. Issued invoices linked to a quote cannot exceed that quote's total.
- Record received payments on issued invoices. Overpayments are rejected. Correct an incorrect payment by voiding it with a reason and recording a replacement; payment records are not deleted.
- Create credit-note drafts against an issued invoice and adjust the lines before issuing. Credits reduce unpaid balance. This version blocks credits exceeding unpaid balance; refunds of paid invoices need a separate accounting process.
- Revise an issued quote by creating a new draft revision. Existing issued quotes, contracts, invoices, and credit notes cannot be edited or deleted.

## Documents and access

PDFs use the document language and currency, copied line-item scope, and the issuer/client identity snapshots captured when issued. Internal notes are not printed. Drafts carry a draft banner. Invoice PDFs also show recorded payments, credits, and current balance. Downloads require an administrator session.

The dashboard shows enquiry counts, follow-ups, draft quotes, outstanding balances per currency, and overdue invoices. The activity log records issuing, acceptance, signatures, payments, credits, and client conversion. Only administrators can access business records or modify website content. No client portal or staff permissions manager is included yet.

## Deployment

Use GitHub **Actions → Deploy to Hostinger → Run workflow** on `main` after pulling this update. The workflow remains manual.

Hostinger needs PHP **8.4+** with **intl**, mbstring, DOM/XML, SQLite, curl, zip, and fileinfo enabled for both CLI and web PHP. The update checks the new dependency requirements before taking the site offline. If it reports a missing extension, enable it in hPanel **Advanced → PHP Configuration → PHP extensions**, then rerun the workflow.

The updater backs up the existing SQLite database outside the public directory, preserves `.env`, administrator passwords, content, uploads, and storage link, and applies the new migration without reseeding. Existing administrator accounts receive the administrator role. Filament assets ship inside the release; PHP `exec` and `symlink` are not needed.

After deployment, check `/manage/login`, the public enquiry form, and `/admin/media`. Configure issuer/tax/template details before issuing real documents. Database backups remain under `laravel/storage/app/deployment-backups`; maintain a separate off-server backup and test restoration before relying on the system as your only financial record.

## Recommended next additions

1. A client portal for quote review, contract downloads, invoice balance, and proof-of-payment uploads.
2. Authenticated electronic signatures through a dedicated provider, retaining signed copies and signature evidence.
3. Transactional email with delivery status, manually approved invoice reminders, and enquiry notifications after SMTP is configured.
4. Project milestones, client approvals, change requests, and delivery checklists linked to the accepted scope.
5. Accountant-reviewed financial exports, paid-invoice refund handling, and payment-provider integration appropriate to the business's merchant account.

Verification includes automated workflow and authorization tests, PDF rendering, desktop/mobile browser checks, and a simulated upgrade of the previous Hostinger release. Live hosting verification still requires running the GitHub deployment workflow.

## Booking requests and WhatsApp

Every website booking or WhatsApp entry now goes through `/book`. Submitting saves a lead (name, email, normalized phone, service, source, message, requested time and timezone), then opens WhatsApp addressed to the existing business number with the complete enquiry and its reference. The client taps **Send** in WhatsApp. If the browser does not open WhatsApp, the saved-request screen offers a continuation button. A failed save never opens WhatsApp. Retrying the same submission does not create another lead.

The contact questionnaire uses the same save-first workflow, including its business, budget and timeline. Booking times are requests awaiting confirmation, not calendar reservations. There is no external calendar or incoming third-party booking integration in this release.

In `/manage/leads` (**Leads & bookings**), review the request, requested time and contact permission, add internal notes, set a follow-up date, or convert the lead into a client. **Prepare WhatsApp** creates a draft with the lead reference; open it in WhatsApp and send it. In **WhatsApp follow-ups**, record a message as sent only after sending it, and choose the next follow-up date. Drafts and manually recorded sends are distinct, and sent history is preserved.

WhatsApp opens with a prepared message; this release does not send messages through the WhatsApp Business API or automatically verify delivery. No Business Platform account is required. Contact opt-in is optional for the project questionnaire; booking requests require permission to discuss the request on WhatsApp. If someone asks to stop messages, disable their WhatsApp permission in the lead. Existing leads do not acquire permission automatically. Outgoing follow-up actions require a valid phone and permission.

## Quote and invoice PDF style

Quotes and invoices use the supplied reference's monochrome layout: client identity, date and document number, description/price columns with service scope bullets, a dark total bar and a footer containing bank/payment details alongside legal business information. VAT, discounts, quantities, recurring billing and paid balances remain visible when applicable. Long lists can continue across pages.

Issued PDF headings show Devis/Facture (or Quote/Invoice) followed by N° and the permanent document number. The client block shows the company without its contact person; the project subject is hidden and validity/due dates remain visible. Metadata titles and filenames use `Client name - Devis/Facture - DD-MM-YYYY` for French documents, or `Client name - Quote/Invoice - DD-MM-YYYY` for English. A company name takes priority over the contact name. Issued documents use the saved client identity and issue date; drafts use their creation date. Dates use Africa/Casablanca. The project subject remains editable separately while drafting.

In Business settings, fill **Payment instructions** with the account holder and bank details and optionally fill **Quote / invoice legal footer** with the legal identity, CNIE, address, ICE, IF, professional tax, phone and email. A blank custom footer uses the existing business identity fields. The custom footer is captured when a document is issued; changing business settings later does not change issued document identities. The reference's bank accounts and stamp are not automatically imported.

The **Preview PDF** action opens the document in a new tab using the browser PDF viewer. Use the viewer’s download button to save it. PDF responses remain private and are not cached.

Quote rows provide **Mark accepted** and **Mark rejected** directly beside the preview, with **Issue** in the **Workflow** menu. Issue first to produce a numbered client quote without the draft banner. Recording a decision on a draft issues it and records the decision atomically, with the same validation and content locking as normal issuance.

Invoices are created from an accepted quote, either through its **Create invoice** workflow action or **Invoices → Create invoice from quote**. Choose **Full payment (100%)** or **Deposit (50%)**. Client, services, deliverables, prices, currency, tax and terms are copied from the quote; invoice forms allow the due date and internal notes to be edited. The PDF identifies the linked quote and payment portion. Payment type describes the amount invoiced, not money received: record actual payments separately. Existing issued invoices remain unchanged.

After recording the full payment against an issued 50% deposit invoice, use its **Workflow → Create final balance invoice** action. The draft is linked to both the accepted quote and deposit invoice, copies the quote services, and invoices exactly the quote total minus the deposit total (including remaining tax, discount and cent rounding). Preview and issue it when work is complete, then record its payment separately. The action prevents duplicate final invoices and requires review if other invoices already bill the same quote.

The client form contains only optional company name, phone, email, client tax identifier, currency and language. Blank currency/language use MAD/French. Clients do not need email or billing address to issue quotes/invoices. Existing contact names and addresses remain stored, while the simplified form hides them. Unnamed clients are identifiable by their client ID in selectors.

Draft quotes and invoices can be permanently deleted using **Workflow → Delete draft**, with confirmation. Issued documents remain protected to preserve numbering, payments and document links.

For confirmed quotes and invoices, **Workflow → Delete** removes the document from admin lists while retaining its number, payment history, linked documents and audit entry. Removed paid invoices still count towards the quote’s invoiced total. Unpaid invoices without dependent documents are cancelled and stop counting so replacements can be issued. Draft deletion remains permanent.

## Automatic monthly billing

In **Finance → Monthly billing**, choose an accepted quote whose billing period and services are Monthly. Set the first invoice date, payment deadline in days and optional last billing date. The quote total is the monthly price; every invoice copies the approved services and is issued automatically at 100% of that price. No monthly schedule is created without an admin selecting the quote.

The `monthly-billing.yml` GitHub workflow checks daily at 07:15 UTC (GitHub can delay scheduled runs); `workflow_dispatch` can run a check manually. It invokes `php artisan billing:run` on Hostinger. Missed active billing periods are caught up, up to twelve per run. Each period can generate only one invoice, even if an invoice is subsequently deleted. Issuance numbers and dates reflect the actual issue date. Pausing stops future invoices; resuming skips paused months. Ending is permanent. Changes to scope or pricing require an accepted revised quote and a new schedule.

The admin notification bell shows newly issued invoices, payments due within seven days, payments due today and weekly overdue reminders. Recording full payment or deleting an invoice stops its reminders. Notifications are stored synchronously and need no queue worker. Billing errors appear on the schedule and notify admins; invoice creation rolls back on failure. These are admin reminders, not automatic WhatsApp or email messages to clients.

## Sales pipeline and client portal

**Sales → Sales pipeline** tracks New inquiry, Contacted, Quote sent, Accepted, In progress, Completed and Lost. Cards highlight follow-ups due today or earlier; Leads & bookings also has a Needs follow-up filter. Moving a card does not issue invoices or accept a quote. To connect documents, convert the inquiry to a client, then select that inquiry in the quote’s **Linked inquiry** field. The link copies to contracts and invoices. Accepting the quote advances early-stage inquiries to Accepted; existing In progress or Completed stages are preserved.

In **Sales → Clients**, choose **Generate portal link**. Copy the private link from the notification and share it with that client only. Links expire after 90 days; generating another immediately revokes the previous link and its sessions. **Revoke portal access** stops all access for that client. No email or separate client account is required. Links are bearer credentials; anyone holding the link can access that client’s documents and accept their quotes. Only token hashes are stored in the database, and links are not emailed or sent through WhatsApp automatically.

The client portal shows the client’s project stages and their issued, non-deleted quotes, contracts, invoices and credit notes, with inline PDF previews and separate balances per currency. Drafts, internal notes and other clients’ information are excluded. Clients can explicitly accept a valid issued quote after checking its terms; acceptance is audited and alerts admins. This is quote acceptance, not an electronic contract signature. Contract signing continues through the existing workflow.
