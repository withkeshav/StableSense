import { describe, expect, it } from 'vitest';
import { renderContributors } from './research-contributors.js';

const contribution = {
  id: 'fixture-validation',
  name: 'Test Contributor',
  contribution: 'Validated a calculation in the test publication.',
  publicationTitle: 'Test publication',
  publicationUrl: 'https://stablesense.withkeshav.com/research/#treasury',
  approvalUrl: 'https://github.com/withkeshav/StableSense/issues/1',
  approvedOn: '2026-10-02',
  incorporatedOn: '2026-10-02',
  approved: true,
  creditConsent: true,
};

describe('research contribution recognition', () => {
  it('renders an honest empty state without issuing badges', () => {
    const result = renderContributors([]);
    expect(result.html).toContain('No contributor badges have been issued yet.');
    expect(result.badges).toEqual({});
  });

  it('generates a permanent contribution card and linked HTML and Markdown embeds', () => {
    const result = renderContributors([contribution]);
    const url = 'https://stablesense.withkeshav.com/research/#contribution-fixture-validation';
    expect(result.html).toContain('id="contribution-fixture-validation"');
    expect(result.html).toContain(contribution.contribution);
    expect(result.html).toContain(contribution.publicationUrl);
    expect(result.html).toContain(contribution.approvalUrl);
    expect(result.html).toContain('Copy website embed');
    expect(result.html).toContain('Copy Markdown');
    expect(result.html).toContain(url);
    expect(result.html).toContain(`[![StableSense research contributor: Test Contributor](`);
    expect(result.badges['fixture-validation.svg']).toContain('<svg');
    expect(result.badges['fixture-validation.svg']).toContain(url);
    expect(result.badges['fixture-validation.svg']).toContain('Validated a calculation');
  });

  it.each([
    { approved: false }, { approved: undefined }, { incorporatedOn: '' },
    { approvedOn: '2026-02-30' }, { creditConsent: false }, { approvalUrl: '' },
    { publicationUrl: 'javascript:alert(1)' }, { approvalUrl: 'https://user:password@example.com/' },
    { id: '../escape' }, { id: '__proto__' }, { name: '' }, { contribution: '' },
    { privateNotes: 'Must not enter the public registry.' },
  ])('refuses to issue recognition from an incomplete or unsafe record: %j', change => {
    expect(() => renderContributors([{ ...contribution, ...change }])).toThrow();
  });

  it('rejects duplicate permanent contribution IDs', () => {
    expect(() => renderContributors([contribution, contribution])).toThrow('Duplicate');
  });

  it('escapes submitted text in HTML, SVG and Markdown embeds', () => {
    const result = renderContributors([{
      ...contribution, name: 'Name [link] <script>alert(1)</script> & "quoted"',
      contribution: '</textarea><img src=x onerror=alert(1)>',
    }]);
    expect(result.html).not.toContain('<script>');
    expect(result.html).not.toContain('<img src=x');
    expect(result.html).toContain('Name \\[link\\]');
    expect(result.badges['fixture-validation.svg']).toContain('&lt;script&gt;');
    expect(result.badges['fixture-validation.svg']).not.toContain('<img src=x');
  });

  it('keeps a withdrawn contribution permalink but issues no badge or embed', () => {
    const result = renderContributors([{
      ...contribution, withdrawnOn: '2026-10-03', withdrawalReason: 'Test correction.',
    }]);
    expect(result.html).toContain('id="contribution-fixture-validation"');
    expect(result.html).toContain('Recognition withdrawn');
    expect(result.html).toContain('Test correction.');
    expect(result.html).not.toContain('data-copy-credit');
    expect(result.badges).toEqual({});
  });

  it('rejects withdrawal without a dated explanation', () => {
    expect(() => renderContributors([{ ...contribution, withdrawnOn: '2026-10-03' }])).toThrow();
  });
});
