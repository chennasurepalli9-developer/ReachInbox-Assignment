import express from 'express';
import bodyParser from 'body-parser';
import { searchEmails } from './search';
import { startImapForAccount } from './imapClient';
import { indexEmail } from './search';
import { classifyEmail } from './classifier';

const app = express();
app.use(bodyParser.json());

// Start IMAP sync for an account (for testing)
app.post('/api/accounts/start', async (req, res) => {
  const cfg = req.body; // { host, port, secure, auth: {user,pass}, accountId }
  startImapForAccount(cfg).catch(err => console.error(err));
  return res.json({ ok: true });
});

// Manual indexing (for Postman tests)
app.post('/api/emails/index', async (req, res) => {
  const email = req.body;
  email.aiLabel = await classifyEmail(email);
  await indexEmail(email);
  res.json({ ok: true });
});

app.get('/api/emails/search', async (req, res) => {
  const q = req.query.q?.toString();
  const accountId = req.query.accountId?.toString();
  const folder = req.query.folder?.toString();
  const label = req.query.label?.toString();
  const result = await searchEmails({ q, accountId, folder, label, size: 50 });
  res.json({ hits: result });
});

app.post('/api/emails/:id/label', async (req, res) => {
  // update label - reindex doc
  const id = req.params.id;
  const newLabel = req.body.label;
  // fetch existing document from ES, update aiLabel, reindex (left as exercise)
  res.json({ ok: true });
});

app.post('/api/replies/suggest', async (req, res) => {
  // Accept email content + product/outreach context id
  // Implementation of RAG shown later
  res.json({ suggestion: 'Example reply' });
});

app.listen(3000, () => console.log('API listening on 3000'));
