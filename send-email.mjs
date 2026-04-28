import sgMail from "@sendgrid/mail";

function requireEnv(name) {
  const v = process.env[name];
  if (v == null || !String(v).trim()) throw new Error(`Missing required env var: ${name}`);
  return String(v).trim();
}

function isDebug() {
  const v = process.env.EMAIL_DEBUG;
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

function log(...args) {
  if (!isDebug()) return;
  console.log("[email]", ...args);
}

function normalizeToList(to) {
  if (Array.isArray(to)) {
    const xs = to.map((x) => String(x ?? "").trim()).filter(Boolean);
    if (xs.length === 0) throw new Error("Recipient (to) is required.");
    return xs;
  }
  const one = String(to ?? "").trim();
  if (!one) throw new Error("Recipient (to) is required.");
  return one;
}

export async function sendEmail({ to, subject, text, html }) {
  const apiKey = requireEnv("SENDGRID_API_KEY");
  const from = requireEnv("SENDGRID_FROM");

  const subj = String(subject ?? "").trim();
  if (!subj) throw new Error("Subject is required.");

  const textBody = text != null ? String(text) : "";
  const htmlBody = html != null ? String(html) : "";
  if (!textBody.trim() && !htmlBody.trim()) throw new Error("Either text or html body is required.");

  sgMail.setApiKey(apiKey);
  const msg = {
    to: normalizeToList(to),
    from,
    subject: subj,
    text: textBody.trim() ? textBody : undefined,
    html: htmlBody.trim() ? htmlBody : undefined,
  };

  log("sending", { to: msg.to, subject: msg.subject, hasText: Boolean(msg.text), hasHtml: Boolean(msg.html) });
  const [resp] = await sgMail.send(msg);
  log("sent", { statusCode: resp?.statusCode });
  return { ok: true, statusCode: resp?.statusCode ?? 202 };
}

