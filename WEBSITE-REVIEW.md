# Website review and recommended direction

This review is based on the repository and local browser rendering. Live administrator credentials were not supplied; the hosting URL was unavailable from the execution environment, so these findings do not claim a fresh authenticated audit of the live site.

## What is working well

- The public site has a consistent visual identity, responsive layouts, and a clear personal-service positioning.
- Services, project pages, case studies, testimonials, and industry pages give visitors several ways to assess the offer.
- The enquiry flow asks useful qualifying questions: service, sector, budget, and urgency.
- WhatsApp provides a practical direct-contact option for the local audience.
- Laravel now controls authentication and content. Existing cookie-session authentication, CSRF protection, upload restrictions, and the separation of private Laravel files from the public document root provide a useful foundation.
- GitHub provides a repeatable build and a manually triggered Hostinger deployment with database backup.

## What needs attention

| Priority | Finding | Recommended change |
| --- | --- | --- |
| High | The previous contact form showed success after a simulated delay and only opened WhatsApp. It did not retain enquiries. | Fixed in this update: save enquiries in Laravel, show success after saving, and retain WhatsApp as an optional follow-up. |
| High | The previous admin was a website editor, with no client, sales, contract, or invoice workflow. | Added a separate Filament business panel with relational records and document/payment workflows. |
| High | Media listing could return a boolean MIME type, causing `startsWith` to crash. | The preceding fix normalizes backend MIME output and guards frontend input. Deploy current `main` to include it. |
| Medium | The booking component links to a generic Calendly destination. | Replace it with your actual booking page or a direct contact call to action; do not imply a working calendar before configuring one. |
| Medium | Footer privacy/terms links do not have corresponding page routes. | Add accurate policy pages covering enquiry storage, contact channels, and the actual service terms. |
| Medium | Several portfolio images use external stock-image URLs, and some referenced client-logo files are absent from the bundled assets. | Use real project screenshots and verified client assets with permission. Check all images after hosting deployment. |
| Medium | Case studies and testimonials need verifiable evidence to carry their full weight. | Publish concrete scope, dates, before/after measures, and attributable testimonials. Verify every numerical claim. |
| Medium | The initial HTML metadata and canonical domain are hardcoded while page metadata is updated in the browser. | Correct the production domain and social preview metadata, then consider prerendering key marketing pages for dependable crawler previews. |
| Medium | The content dashboard includes a broad “Reset All Data” action. | Add a clear confirmation, export/restore path, and granular edits before expanding access beyond one trusted administrator. |
| Later | Analytics, ongoing backups, and conversion reporting are not an established operational workflow. | Measure enquiry-to-quote and quote-to-payment outcomes; keep off-server backups and test restores. |

## Best backend option

**Keep Laravel and use Filament for business administration; preserve the existing React marketing site.** This fits the current hosting, gives mature forms/tables/login behavior, and avoids rewriting the public design to build an admin panel.

| Option | Fit | Tradeoff |
| --- | --- | --- |
| Laravel + Filament | Best current choice; implemented in this update | Flexible business workflows within your own application; some configuration and maintenance remain yours. |
| Fully custom React admin + Laravel API | Useful later for highly specialized interactions | More development and testing for forms, tables, validation, and permissions. |
| External CRM / invoicing service | Useful if standard accounting operations matter more than bespoke workflows | Subscription costs and integration work; client records and document flow split across systems. |

A second backend rewrite would add cost without solving the main issue. The larger improvement is organizing sales and delivery around connected client records.

## Product roadmap

Start with enquiry capture, clients, scoped service pricing, quotes, contracts, invoices, PDFs, and recorded payments. That foundation is included in this update. Confirm legal identity, applicable tax treatment, contract terms, and service prices before issuing documents.

Next, add a client portal with a simple timeline: quote received, accepted, agreement signed, deposit paid, work in progress, delivery approved, balance settled. Follow it with electronic signatures and transactional email. Add project milestones and change requests so requests outside the signed scope can generate a new approved quote.

Avoid treating recurring marketing retainers as one-time charges. Keep their billing period explicit now and add scheduled billing only after payment/reminder behavior is defined. Keep all reporting grouped by currency rather than adding MAD, EUR, and USD totals together.
