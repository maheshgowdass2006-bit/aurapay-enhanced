# AuraPay — Payment Safety Demo

AuraPay is a front-end prototype for exploring safer payment journeys. It does not connect to UPI, banks, payment apps, SMS, or live merchant registries. No real payment is sent, and all contacts, recipients, bills, merchant records, risk labels, and verification results are sample data.

## Demo Flows

- **Pay to my friends:** Choose from the fictional contact list, review its sample UPI ID and demo profile label, then enter an amount.
- **Pay to merchant:** Choose a sample merchant or enter a UPI ID. An exact match in the local sample directory is shown as a demo directory match.
- **Pay new user:** Enter a sample UPI ID and review the simulated name-match and safety prompts.
- **Payments above ₹10,000:** The demo adds an intent review and a fingerprint or passkey choice before continuing to the simulated device check and demo UPI PIN screen.
- **Prompt interface:** Try "Pay to my friends", "Pay to merchant", "Pay new user", or "Send ₹15,000" from the home screen.

A match only means the sample data matched. It does not establish that a real person or merchant is genuine or safe. No real fingerprint is read, no real passkey is created, and no real payment is processed.

## Run Locally

1. Install Node.js (version 20.19+ or 22.12+).
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local address printed in the terminal.

To make a production build, run `npm run build`.