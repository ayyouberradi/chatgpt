# Connect WhatsApp Business

The integration is installed but sending is disabled by default. Website enquiries continue to save in **Sales → Leads & bookings**. The existing prepared WhatsApp enquiry message remains available. Automated messages below go to the consenting client; they are not a notification to the administrator’s personal number.

## Meta setup

1. Set up a Meta Business Portfolio, WhatsApp Business Platform app and business phone number. Complete Meta’s verification and production access requirements.
2. Create approved message templates for the language selected in the admin panel. Use positional body parameters in exactly the following order, without header or button parameters:
   - Booking confirmation: client name, enquiry reference, requested service, preferred booking date/time (four parameters).
   - Follow-up: client name, enquiry reference, requested service (three parameters).
3. Example French bodies (submit to Meta for approval):

   Confirmation: `Bonjour {{1}}, nous avons reçu votre demande {{2}} pour {{3}}. Date souhaitée : {{4}}. Répondez à ce message pour préciser votre demande.`

   Follow-up: `Bonjour {{1}}, souhaitez-vous poursuivre votre demande {{2}} pour {{3}} ? Répondez à ce message si vous souhaitez en discuter.`

   Meta determines template approval and category. Follow-up templates may require marketing approval. Templates, language codes and consent must match your actual business use.

4. In the private Hostinger Laravel `.env`, set:

   ```dotenv
   WHATSAPP_ACCESS_TOKEN=your-production-access-token
   WHATSAPP_PHONE_NUMBER_ID=your-numeric-phone-number-id
   WHATSAPP_APP_SECRET=your-meta-app-secret
   WHATSAPP_VERIFY_TOKEN=your-own-long-random-verification-token
   WHATSAPP_GRAPH_VERSION=v23.0
   ```

   Use a currently supported Graph API version when configuring Meta. Keep secrets on the server; do not put them in GitHub source, browser settings or chat. Run `php artisan config:cache` after changing the environment.

5. Configure the Meta webhook callback:
   `https://salmon-turtle-767162.hostingersite.com/integrations/whatsapp/webhook`
   Enter the same verification token and subscribe to WhatsApp `messages` events. The endpoint verifies signed requests with the app secret and restricts events to the configured phone number ID.
6. In **Settings → WhatsApp Business**, enter the exact approved template names and language. Enable confirmations, optionally follow-ups, then automatic sending. The form blocks enabling if required configuration is missing. Test with a consenting test contact before normal use.

## Behaviour and monitoring

New, consented website enquiries queue one confirmation after the lead is saved. The application attempts sending after the response; an hourly GitHub Actions workflow processes pending messages and due follow-ups as a fallback. GitHub may delay scheduled runs. Existing leads are not automatically enrolled when sending is enabled.

If follow-ups are enabled, an accepted confirmation schedules a follow-up after three days. The next follow-up is seven days later, with at most two automatic follow-ups per lead. Replies stop automatic follow-ups and appear in **Sales → WhatsApp replies**. Accepted, In progress, Completed and Lost leads are excluded from automatic follow-ups. Revoked consent and changed phone numbers cancel pending messages.

**Sales → WhatsApp outbox** shows queued, API-accepted, sent, delivered, read, failed, cancelled and unknown messages. API acceptance is not proof of delivery. Signed Meta delivery events update the status without moving it backwards. Administrators can cancel queued messages or explicitly queue an approved follow-up template from a consented lead.

Explicit rate-limit rejections retry at most three attempts. Network timeouts or uncertain API results become **Unknown** and are not automatically resent, preventing accidental duplicate messages. Pending messages expire after 24 hours. Check Meta and the outbox before manually sending another message.

The hourly `whatsapp.yml` workflow uses the existing Hostinger SSH secrets and shares the deployment lock. For a connection check without sending, run `php artisan whatsapp:run --check`. `php artisan whatsapp:run` processes eligible messages only when enabled and configured.
