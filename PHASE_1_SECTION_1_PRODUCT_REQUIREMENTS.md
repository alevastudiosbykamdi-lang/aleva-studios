# Aleva Studios by Kamdi — Phase 1, Section 1: Product Requirements

**Status:** Draft for business-owner review  
**Scope:** Backend product requirements only  
**Source of truth:** The project initialization brief and the clarifications in the Section 1 request. This document records requirements; it does not authorize implementation or settle pending policy decisions.

## 1. Product overview

Aleva Studios by Kamdi is a photography business whose backend will support the end-to-end customer and operational journey: public discovery, enquiry and booking, agreed partial payment and confirmation, photography session, original image upload, private client selection, editing, final gallery release, and client access to delivered photographs. It will also support the staff and administrators who manage those operations and public-facing business content.

The backend serves three consuming interfaces: a public website, a client portal, and an admin dashboard. This project does not include frontend pages, components, layouts, or other user-interface implementation.

## 2. Backend scope and boundaries

### In scope

- Business APIs, validation, workflows, authorization, and data access required by the three interfaces.
- User profiles and client, staff, administrator, and super-administrator access management.
- Services, packages, enquiries, bookings, availability, payment records, galleries, selections, editing and delivery workflows.
- Public website content management, including portfolio, blog, FAQs, contact/about/home content, and approved testimonials.
- Cloudinary image-storage integration, Paystack payment processing, Resend application email, Supabase Auth email OTP, and Supabase PostgreSQL.
- Administrative oversight, operational reporting, and activity history.
- Security, reliability, documentation, testing, and deployment requirements to be elaborated in later Phase 1 sections and phases.

### Out of scope

- Frontend implementation for any of the three interfaces.
- Staff task assignment. No task queue, assignment, or assignment workflow is required.
- Hardcoded booking prices, deposit amounts or percentages, selection limits, capacity rules, retention periods, cancellation terms, or refund terms before business confirmation.
- Additional frameworks, infrastructure, or unrelated product features without a clear technical reason and approval.
- Final database schema, API endpoint design, or implementation in this requirements section.

## 3. Functional requirements by module

The requirements below describe backend capabilities without prescribing tables, endpoints, or implementation structure.

### 3.1 Authentication and authorization

- Support client authentication using Supabase email OTP and verify authenticated sessions for protected operations.
- Support user profile and account lifecycle operations, including profile updates and account status/access management.
- Enforce authorization on the server for every protected operation and resource, including client ownership restrictions and staff/admin privileges.
- Support distinct roles and permissions for clients, staff, administrators, and super administrators. The final permission model is not established here.
- Support account suspension and restriction of access as authorized administrative actions.
- Keep Supabase Auth OTP delivery configuration distinct from application email sent through Resend.

### 3.2 Users, clients, staff, and administrators

- Maintain client-facing profile information and allow clients to view and update permitted profile fields.
- Allow authorized administrators to find and manage client records, account status, booking history, payment history, and associated order history.
- Support administrative management of staff and administrator accounts and their access, subject to the permission model defined later.
- Associate operational work with the relevant booking/order and record the staff member responsible for uploading that client's photographs and the staff member responsible for editing them.
- Make those responsibility records available for administrative tracking and staff performance reporting. These records do not represent task assignment.

### 3.3 Services and packages

- Publish active photography services and packages for public discovery.
- Provide service/package descriptions, pricing, and relevant metadata to consuming interfaces.
- Allow authorized administrators to create, update, publish, unpublish, and otherwise manage services and packages.
- Preserve the applicable service/package context on enquiries and bookings sufficiently for business and administrative review; how price changes affect existing bookings remains to be defined in architecture/business workflow.

### 3.4 Booking enquiries and reservations

- Accept public booking enquiries and make them available to authorized staff for follow-up.
- Support booking requests associated with a client or prospective client, selected service/package where applicable, preferred date/time information, and relevant enquiry details.
- Distinguish enquiry/request stages from a confirmed reservation and make booking status visible to appropriate users.
- Allow clients to view booking details and history and request permitted updates or cancellations.
- Allow authorized administrators to review, create/manage, update, confirm, and cancel bookings according to approved business rules.
- A booking becomes confirmed after the client pays an agreed fraction of the total booking amount. The fraction and operational handling of partial/remaining balances require business confirmation.
- Validate booking requests against published availability and apply conflict prevention once capacity, slot, reservation, and conflict rules are approved.
- Keep booking status and associated payment status coherent and auditable.

### 3.5 Availability management

- Allow administrators to create and update available booking dates, and open or close dates.
- Allow the backend to expose available dates publicly.
- Support the eventual representation of time slots, capacity, blackout dates, and booking associations if the business confirms they are needed.
- Validate booking requests against current availability and prevent conflicts under approved rules.
- Support changes to availability when bookings already exist, following a policy still to be confirmed.

### 3.6 Payments and financial operations

- Initialize Paystack payments for the amount due under the applicable booking/payment rules and generate unique payment references.
- Verify payment status server-side with Paystack; do not treat a client-side return as proof of payment.
- Receive Paystack webhooks, validate their signatures, and protect payment records and booking transitions from duplicate event processing.
- Record payment attempts and outcomes, associate payments with relevant bookings/clients, and expose appropriate payment history to clients and administrators.
- Represent failed, abandoned, successful, and (where applicable) refunded payments for operational follow-up and reconciliation.
- Provide administrative visibility into payment status and reconciliation exceptions.
- Support refunds only under a policy and operational process confirmed by the business.
- Keep booking fees, deposits, and payment fractions configurable; do not hardcode values before confirmation.

### 3.7 Photography uploads and storage

- Integrate with Cloudinary for original and edited photograph storage.
- Authorize uploads and access through backend-controlled rules; private client photographs must not be publicly exposed by default.
- Associate photographs with the relevant client, booking/order, gallery, and workflow stage as appropriate.
- Maintain photograph metadata and ordering information needed for gallery presentation and administration.
- Record which staff member is responsible for uploading a client's photographs, associated with the relevant booking/order.
- Support administrative control over access and explicit revocation.
- Preserve original photograph access after selection submission until an administrator explicitly revokes it. Selection submission must not automatically delete originals or revoke original access.

### 3.8 Galleries and client photograph selection

- Allow authorized staff/admins to create, manage, and release private galleries for clients.
- Verify client identity and ownership before allowing access to a private gallery or its photographs.
- Allow clients to view their private gallery and select preferred photographs.
- Support selection progress and submission so clients can see/manage their selection before submission and know when it has been submitted.
- Allow administrators to review submitted selections and administer the selection workflow.
- Enforce a selection limit only after the business confirms the quantity/rule.
- Keep originals accessible after selection submission until explicitly revoked by an administrator.

### 3.9 Editing workflow

- Track editing progress and workflow status for photographs or the relevant booking/gallery as the approved workflow defines.
- Record the staff member responsible for editing the photographs and the associated booking/order.
- Allow authorized administrators to update editing status, monitor progress, and manage edited photograph uploads.
- Record relevant administrative actions affecting editing and release.
- Do not implement staff task assignment. Individual assignment, workload allocation, and task queue behavior are excluded.

### 3.10 Final photograph delivery

- Allow authorized administrators to control when a final gallery is released.
- Notify the appropriate client when final photographs become available, subject to notification configuration and delivery handling.
- Allow clients to access and download released final photographs, subject to account, ownership, and access rules.
- Support access revocation by authorized administrators.
- Gallery retention and access expiry policies remain pending; the backend must not apply an invented expiry policy.

### 3.11 Reviews and ratings

- Allow clients to provide a five-star rating associated with the relevant order/history and the responsible staff member, enabling staff performance tracking.
- Allow authorized administrators to review/moderate ratings and testimonials before public display where applicable.
- The rating submission window, editability, uniqueness, moderation rules, and whether written review text is supported remain to be confirmed or specified in a later section.

### 3.12 Public website content

- Provide public retrieval of managed home page content, about information, contact information, services/packages, FAQs, blog/articles, approved reviews/testimonials, and portfolio content.
- Allow authorized administrators to create, update, publish, unpublish, and order applicable content.
- Expose only content marked for public publication; private operational/client data must not appear through public content retrieval.

### 3.13 Portfolio management

- Allow administrators to manage portfolio categories and portfolio images, including metadata, ordering, and publication status.
- Provide public retrieval of published categories and items.
- Use authorized image storage/access controls for portfolio assets as appropriate to their public status.

### 3.14 Blog and FAQ management

- Allow administrators to create, edit, publish, unpublish, and organize blog articles and FAQs.
- Provide public access only to published content.
- Preserve the information required to present and organize entries, such as titles, body/content, and publication/ordering information, with exact content model deferred to architecture.

### 3.15 Notifications and email

- Use Resend for application-generated email and notifications, including booking enquiry acknowledgement, booking confirmation/status changes, payment confirmation, gallery availability, final gallery availability, and administrative notifications.
- Support selection reminders and editing updates where the business chooses to send them.
- Track notification delivery outcomes sufficiently to investigate delivery failures and avoid silently losing important operational messages.
- Handle retry or manual follow-up behavior according to the notification design established later.
- Keep Supabase Auth OTP delivery configured as an authentication function; Resend does not automatically replace it.

### 3.16 Administrative operations, reporting, and activity tracking

- Provide administrative oversight for bookings, clients, payments, availability, services/packages, staff/admin accounts, galleries, selections, editing, website content, portfolio, blog, FAQs, reviews, and notifications, subject to permissions.
- Provide dashboard statistics and operational reporting useful for current business operations.
- Support reporting on booking and payment state, staff upload/edit responsibility, and client ratings associated with orders and responsible staff.
- Record relevant administrative actions and workflow changes to support accountability and investigation.
- Provide client communication history associated with the relevant client and booking as a recommended capability (see Section 7); the exact channels and capture method require approval.
- Define reporting metrics and visibility permissions in a later requirements/architecture section; do not assume all staff may see financial or personnel data.

## 4. Requirements by consuming interface

### 4.1 Public website

Unauthenticated visitors must be able to:

- Browse published services and packages, including descriptions, prices, and public metadata.
- Browse published portfolio categories and images.
- Read published home/about/contact content, FAQs, blog/articles, and approved reviews/testimonials.
- Retrieve publicly available booking dates.
- Submit a booking enquiry or request with relevant service/package and preferred date/time details.
- Receive an acknowledgement through the applicable notification flow where configured.

Public access must not reveal client records, booking/payment details, private galleries, unpublished content, or administrative data. Any payment initiation flow for a visitor must follow the approved booking and client identity process; the detailed flow is not settled in this section.

### 4.2 Client portal

Authenticated clients must be able to:

- Access and update permitted profile information.
- View their own booking details and history, statuses, and relevant payment history.
- Access only their own private galleries and photographs.
- View gallery selection progress, select preferred photographs, and submit selections.
- Access and download final photographs after authorized release.
- Receive booking, payment, gallery, editing (if enabled), and delivery notifications.
- Submit a five-star rating associated with the relevant order/history and responsible staff member, subject to approved rating rules.

Clients must not access another client's records or control administrative workflow, payment verification, gallery release, or staff responsibility records.

### 4.3 Admin dashboard

Authorized staff and administrators must be able to perform permitted operations for:

- Booking enquiries, bookings, status transitions, amendments/cancellations, and client communication follow-up.
- Availability dates and, once rules are approved, slots, capacity, blackouts, and conflict management.
- Clients, staff, administrators, account status, and access controls according to their permissions.
- Services, packages, and public content (home/about/contact, portfolio, blog, FAQs, approved reviews).
- Payment status, exceptions, history, and reconciliation; payment state must be grounded in server-side verification.
- Original and edited photograph uploads, private gallery management, client selections, selection review, editing progress, release, and access revocation.
- Notification outcomes and operational follow-up.
- Dashboard statistics, operational reports, staff upload/edit responsibility, ratings, and relevant activity history.

Super-administrator-only capabilities will include the highest level of access and management of staff/admin access, roles, and permissions, subject to the final permission model.

### 4.4 Shared capabilities

Authentication/session verification, profile and account state, booking and payment lifecycle data, availability validation, private asset authorization, notification status, and activity records are shared backend capabilities. Each interface receives only the operations and data permitted to its user and context. Public content is administered through the admin dashboard and consumed by the public website; client booking/gallery/payment data is managed operationally by the admin dashboard and exposed to the relevant client only under ownership checks.

## 5. User roles and responsibilities

| Role | Responsibilities and expected capabilities |
|---|---|
| Public visitor | Discover published content and services, view availability, and submit an enquiry or booking request. No access to protected client or administrative data. |
| Registered client | Authenticate by email OTP; manage permitted profile details; access own bookings, payments, private galleries and released finals; select photographs; submit a five-star rating. |
| Staff member | Carry out operational work permitted by assigned access, including relevant booking/client support, photograph upload or editing. Backend records upload/edit responsibility against the relevant order/booking. No task assignment system is required. |
| Administrator | Manage the operational areas granted to them, including bookings, clients, availability, services, payments, galleries, editing, content, notifications, and reporting as authorized. |
| Super administrator | Highest administrative privileges, including staff/administrator account, role, and permission management and other privileged operations. |

Different staff responsibilities may require different permissions (for example, booking support, payment visibility, content management, photo upload, editing, selection review, or account administration). The permission structure, role-to-permission mapping, separation of sensitive duties, and who may grant privileges are not finalized here. Authorization must always be enforced server-side.

## 6. Non-functional requirements

- **Reliability:** Core booking, payment, gallery, and notification workflows should fail predictably and preserve enough state for safe retry or administrative follow-up. External service failures must not be mistaken for successful payment or delivery.
- **Performance:** Common public content, availability, client history, and administrative reads should respond promptly under expected usage. Concrete service-level targets and load assumptions require operational context before being set.
- **Scalability:** The design should support growth in clients, bookings, photographs, staff, and content without requiring a change to the product workflows. Specific scale targets are not yet known.
- **Maintainability:** Use the agreed Node.js, Express.js, TypeScript, Supabase PostgreSQL stack; document behavior, configuration, migrations, and operational procedures as the relevant phases are completed. Avoid unnecessary dependencies and infrastructure.
- **Data integrity:** Preserve valid relationships between clients, bookings, payment records, galleries, photographs, selections, responsible staff, and ratings. Validate state transitions and prevent duplicate payment effects and conflicting reservations under approved rules.
- **Privacy:** Enforce client ownership and staff/admin permissions on the server. Protect private images and sensitive profile, booking, and payment information. Public retrieval must expose only published public content.
- **Service availability:** The deployed backend should be monitored and recoverable in line with agreed operational needs. Availability objectives, maintenance expectations, and recovery targets require confirmation during architecture/operations work.
- **Auditability:** Record relevant privileged actions, workflow status changes, payment events, and staff upload/edit responsibility with enough context for operational investigation and reporting. Retention and access policies for audit records remain to be defined.
- **Error handling:** Return consistent, non-sensitive errors to consuming interfaces; retain useful diagnostic context for operators without exposing secrets or private data.
- **Observability:** Provide structured operational logs and health/readiness visibility, with monitoring for application and integration failures. Log retention, alert routes, and service-level thresholds are to be defined later.
- **Security:** Validate inputs, protect secrets, verify payment webhooks, secure authentication and storage access, and apply least privilege. Detailed controls and threat considerations belong in the Security and Operations section.

## 7. Missing or recommended capabilities

These findings are separated from confirmed requirements. Recommendations require business-owner approval before becoming committed scope. Optional enhancements are not part of the current delivery commitment.

### Essential requirements

These are necessary to fulfill already confirmed workflows safely; they do not introduce a separate business policy:

- Distinguish booking enquiry/request from confirmed booking and retain the status/history needed to follow the journey.
- Associate payment records and verification outcomes with the correct booking/client and safely handle duplicate webhook delivery.
- Enforce client ownership checks for bookings, payment history, private galleries, and final files.
- Track client photograph selection progress and submission so clients and administrators can tell the current state.
- Record the responsible upload and editing staff members against the associated booking/order, and associate client ratings with that history and staff member.
- Retain relevant administrative activity and workflow history so consequential operations can be investigated.
- Detect and surface failed important notifications for follow-up; email delivery cannot be assumed merely because an application attempted to send.

### Recommended capabilities — approval required

- **Client communication history:** Keep a booking-linked history of important client communications and follow-up. Decide whether this means only application-sent messages or also staff-recorded offline conversations, and which channels are in scope.
- **Payment reconciliation workflow:** Provide an explicit administrative process/report for comparing local payment records to Paystack outcomes and handling exceptions. Payment history and server verification are confirmed; the reconciliation workflow details need approval.
- **Booking amendments workflow:** Define a controlled amendment process, including which fields may change, who approves changes, and how changes affect availability and payment. Booking updates are required generally, but exact amendment rules are not settled.
- **Availability change impact handling:** Notify or flag affected existing bookings when dates are closed or changed. The exact resolution and customer policy require approval.
- **Selection reminder policy:** Decide whether reminders are needed, when they are sent, and whether clients can opt out or the business can suppress them.
- **Operational reports and metrics:** Approve the initial dashboard measures, filters, export needs, and access by role; avoid collecting or exposing unnecessary data.

### Optional future enhancements — not current scope

- Automated review requests, richer review text/media, or public response workflows beyond the confirmed five-star rating and review moderation needs.
- Client self-service rescheduling/cancellation beyond the currently required ability to update/cancel subject to policy.
- Advanced financial forecasting, accounting exports, or automated reconciliation beyond an approved initial operational need.
- Advanced notification preference management, multiple channels, or marketing campaigns.
- Automated archival or deletion jobs for images once a retention policy is decided.

## 8. Confirmed requirements

- Backend only, serving public website, client portal, and admin dashboard.
- Agreed stack: Node.js, Express.js, TypeScript, Supabase PostgreSQL/Auth, Cloudinary, Paystack, Resend, and Render deployment.
- Supabase email OTP authentication; application notifications use Resend, and OTP delivery must be configured separately.
- Booking confirmation occurs after payment of an agreed fraction of the total booking amount.
- Administrators manage booking availability by creating, updating, opening, and closing dates; public visitors can retrieve available dates.
- Staff task assignment is not required and must not be introduced.
- The backend records the staff member responsible for photo upload and the staff member responsible for editing, tied to the relevant order/booking for tracking and performance reporting.
- Clients can provide five-star ratings associated with the relevant order/history and responsible staff member.
- Client private-gallery viewing and photograph selection are confirmed core capabilities.
- Submitting selections does not delete originals or revoke original-photo access; originals remain available until an administrator explicitly revokes access.
- Paystack payment initialization, server-side verification, signed webhook verification, duplicate-event protection, payment records, and booking association are required.
- Cloudinary-based secure upload/storage, private galleries, editing workflow, edited-photo upload, controlled final release, client access/download, and revocation are required.
- Public content, portfolio, blog, FAQs, approved reviews, notifications, administrative management, operational reporting, and activity tracking are within the eventual backend scope.
- No final database/API design or implementation is authorized in this section.

## 9. Pending client decisions

These are business choices, not gaps to fill with assumed defaults:

1. Booking fee amounts and package pricing rules, including whether/how prices can change after a request.
2. The exact fraction, amount, or percentage of the total booking amount required for confirmation, and how remaining balances are handled.
3. Wedding/event deposit rules and whether they differ from other bookings.
4. Availability capacity, time-slot model, simultaneous booking rules, blackout behavior, conflict resolution, and handling when availability changes around existing bookings.
5. Reservation hold/expiry rules while payment is incomplete and the effect of expiry on availability.
6. Cancellation, amendment, and refund policies, including who may approve exceptions.
7. Selection maximums/quantity rules, if any, and whether rules vary by service/package.
8. Gallery retention, original/final access expiry, archival/deletion, and revocation policies.
9. Whether ratings include written review text, rating eligibility/timing/editing, and moderation/publication rules.
10. The approved initial permission model and which staff roles may see or manage sensitive operational, payment, client, content, and staff data.
11. Whether client communication history includes staff-entered offline contacts and which channels must be recorded.
12. Initial dashboard/report metrics, permitted audiences, and any export requirements.

Items 1–8 are explicitly identified business policies from the project brief and clarifications. Items 9–12 are decisions or scope details raised by this requirements exercise that need business-owner direction before they are treated as committed behavior.

## 10. Section acceptance criteria

This section is acceptable when:

- The requirements cover all functional modules in the project brief and the clarifications supplied for this section.
- Backend responsibilities are organized by module and by public website, client portal, admin dashboard, and shared backend capability.
- Role responsibilities are described without pretending the final staff permission structure has been approved.
- Booking confirmation after an agreed partial payment, availability management/public retrieval, no task assignment, staff upload/edit accountability, five-star ratings tied to order/history and staff, and client photo selection are recorded as confirmed.
- Selection quantity, payment fractions/fees, capacity/conflict behavior, cancellation/refund, expiry/retention, and other unresolved policies are clearly marked pending rather than guessed.
- Essential operational safeguards are distinguished from recommendations requiring approval and optional future enhancements.
- Non-functional requirements are stated without arbitrary performance or infrastructure targets.
- No database tables, schemas, endpoint definitions, implementation code, migrations, package changes, or other repository modifications are included in this deliverable.
- The business owner reviews this document before work proceeds to Phase 1, Section 2.
