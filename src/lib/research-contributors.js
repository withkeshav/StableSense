// Apache-2.0. Static recognition of contributions approved by the maintainer.
const HUB_URL = 'https://stablesense.withkeshav.com/research/';

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function validateRecord(record) {
  if (!record || record.approved !== true || record.creditConsent !== true) {
    throw new Error('Recognition requires explicit approval and consent to public credit');
  }
  const publicFields = new Set(['id', 'name', 'contribution', 'publicationTitle', 'publicationUrl',
    'approvalUrl', 'approvedOn', 'incorporatedOn', 'approved', 'creditConsent', 'websiteUrl',
    'permissionUrl', 'withdrawnOn', 'withdrawalReason']);
  if (Object.keys(record).some(field => !publicFields.has(field))) {
    throw new Error('Unrecognized field in public contributor record');
  }
  for (const field of ['id', 'name', 'contribution', 'publicationTitle', 'publicationUrl',
    'approvalUrl', 'approvedOn', 'incorporatedOn']) {
    if (typeof record[field] !== 'string' || !record[field].trim() || /[\u0000-\u001f]/.test(record[field])) {
      throw new Error(`Missing or invalid contributor field: ${field}`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id)) throw new Error('Invalid permanent contribution ID');
  for (const field of ['publicationUrl', 'approvalUrl', 'websiteUrl', 'permissionUrl']) {
    if (record[field] === undefined) continue;
    const url = new URL(record[field]);
    if (!record[field].startsWith('https://') || url.protocol !== 'https:' || url.username || url.password) {
      throw new Error(`Contributor ${field} must be an HTTPS URL without credentials`);
    }
  }
  for (const field of ['approvedOn', 'incorporatedOn', 'withdrawnOn']) {
    if (record[field] === undefined) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record[field]) ||
      new Date(record[field]).toISOString().slice(0, 10) !== record[field]) {
      throw new Error(`Invalid contributor date: ${field}`);
    }
  }
  if (record.withdrawnOn !== undefined && (typeof record.withdrawalReason !== 'string' || !record.withdrawalReason.trim())) {
    throw new Error('Withdrawal requires a public explanation');
  }
}

export function renderContributors(records) {
  if (!Array.isArray(records)) throw new Error('Contributor records must be an array');
  const ids = new Set();
  for (const record of records) {
    validateRecord(record);
    if (ids.has(record.id)) throw new Error(`Duplicate contribution ID: ${record.id}`);
    ids.add(record.id);
  }
  const badges = {};
  const cards = records.map(record => {
    const url = `${HUB_URL}#contribution-${record.id}`;
    if (record.withdrawnOn !== undefined) {
      return `<article class="contributor-card" id="contribution-${record.id}">
        <h3>${escapeHtml(record.name)}</h3><p>${escapeHtml(record.contribution)}</p>
        <p><strong>Recognition withdrawn ${escapeHtml(record.withdrawnOn)}.</strong> ${escapeHtml(record.withdrawalReason)}</p>
        <p><a href="${url}">Permanent contribution link</a></p>
      </article>`;
    }
    const badgeUrl = `${HUB_URL}badges/${record.id}.svg`;
    const alt = `StableSense research contributor: ${record.name}`;
    const embed = `<a href="${url}"><img src="${badgeUrl}" alt="${escapeHtml(alt)}" width="280" height="56"></a>`;
    const markdownAlt = alt.replace(/[\\[\]()*_`!<>]/g, '\\$&');
    const markdown = `[![${markdownAlt}](${badgeUrl})](${url})`;
    badges[`${record.id}.svg`] = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="56" viewBox="0 0 280 56" role="img" aria-labelledby="title description">
<title id="title">${escapeHtml(alt)}</title>
<desc id="description">${escapeHtml(record.contribution)} Contribution record: ${escapeHtml(url)}. Recognition, not ownership or endorsement.</desc>
<rect width="280" height="56" rx="6" fill="#14201A"/>
<text x="12" y="24" font-family="system-ui, sans-serif" font-size="14" fill="#FAFAF8">StableSense</text>
<path d="M104 12v32" stroke="#B8863D"/>
<text x="116" y="24" font-family="system-ui, sans-serif" font-size="13" fill="#FAFAF8">Research Contributor</text>
<text x="12" y="44" font-family="system-ui, sans-serif" font-size="11" fill="#D8DBD1">View the approved contribution</text>
</svg>`;
    return `<article class="contributor-card" id="contribution-${record.id}" aria-labelledby="credit-${record.id}">
      <h3 id="credit-${record.id}">${escapeHtml(record.name)}</h3>
      ${record.websiteUrl ? `<p><a href="${escapeHtml(record.websiteUrl)}" rel="ugc noopener noreferrer">Contributor website</a></p>` : ''}
      <p>${escapeHtml(record.contribution)}</p>
      <p><a href="${escapeHtml(record.publicationUrl)}">${escapeHtml(record.publicationTitle)}</a></p>
      <p class="as-of">Approved ${escapeHtml(record.approvedOn)}. Incorporated ${escapeHtml(record.incorporatedOn)}. <a href="${escapeHtml(record.approvalUrl)}">Approval record</a></p>
      ${record.permissionUrl ? `<p><a href="${escapeHtml(record.permissionUrl)}">Contribution permission record</a></p>` : ''}
      <p><a class="contributor-permalink" href="${url}">Permanent contribution link</a></p>
      <a class="contributor-badge" href="${url}"><img src="./badges/${record.id}.svg" alt="${escapeHtml(alt)}" width="280" height="56"></a>
      <details class="contributor-embed">
        <summary>Embed this badge</summary>
        <label for="embed-${record.id}">Website HTML</label>
        <textarea id="embed-${record.id}" readonly rows="4" spellcheck="false">${escapeHtml(embed)}</textarea>
        <button type="button" class="hub-chip" data-copy-credit="embed-${record.id}">Copy website embed</button>
        <label for="markdown-${record.id}">Markdown</label>
        <textarea id="markdown-${record.id}" readonly rows="4" spellcheck="false">${escapeHtml(markdown)}</textarea>
        <button type="button" class="hub-chip" data-copy-credit="markdown-${record.id}">Copy Markdown</button>
        <p class="contributor-copy-status as-of" role="status" aria-live="polite"></p>
      </details>
    </article>`;
  });
  return {
    html: cards.length ? `<div class="contributor-grid">${cards.join('\n')}</div>`
      : '<p class="contributor-empty">No contributor badges have been issued yet.</p>',
    badges,
  };
}
