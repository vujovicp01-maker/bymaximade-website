# Lead automation

Not deployed (`.assetsignore`). The workflow itself lives in n8n (`mneautomation.online`,
"bymaximade — Lead Intake"), which keeps its version history; the JSON is not committed
because this repo is public and it holds the prompts and guardrails.

## Flow
Form → Web3Forms → email in contact@bymaximade.com (Reply-To = lead) → n8n Gmail Trigger
(every minute) → email checks → Gemini research (website + web search) → Apify Instagram →
Gemini classify + write → rules → Gmail label + brief email → draft in the lead's thread →
auto-sent after 3–10 min only for clear, real leads.

## Form contract
n8n reads the fields from the Web3Forms notification's HTML (one bold label + value per
field, label = field name). The subject decides the kind: `Your project inquiry #<ref> —
bymaximade` is an inquiry, `… New application — …` an application. Changing field names or
subjects means updating the n8n "Parse & dedupe" node too.

## Owner setup (once)
1. web3forms.com: create an access key for contact@bymaximade.com; put it in both forms.
2. n8n: open credential "bymaximade contact@ Gmail", sign in as contact@. Run the
   "Setup labels" manual trigger once.
3. Google Cloud: set the OAuth app's publishing status to In production (Testing tokens die in 7 days).
4. contact@ Gmail: "Send mail as" name `bymaximade`; filter `from:web3forms.com` → Never send to Spam.
5. Cloudflare DNS `_dmarc`: `v=DMARC1; p=none; rua=mailto:contact@bymaximade.com`; after 2–4
   clean weeks move to `p=quarantine`.

## Operating
- `Config` node: `TEST_MODE` (true = everything is a draft), `DAILY_SEND_CAP`, delays.
- Gmail labels: Leads/Qualified, Leads/Review, Leads/Small budget, Leads/Spam, Applications.
- Cancel an auto-send: delete the draft in the thread during its wait.
