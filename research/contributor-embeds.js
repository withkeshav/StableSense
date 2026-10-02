// Apache-2.0. Credit and snippets are static HTML; copying is optional.
document.querySelectorAll('[data-copy-credit]').forEach(button => {
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copyCredit);
    const status = button.closest('.contributor-embed').querySelector('[role="status"]');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(source.value);
      status.textContent = 'Copied. Paste this code into your website or profile.';
    } catch {
      source.focus();
      source.select();
      status.textContent = 'Automatic copying is unavailable. The code is selected: copy it manually.';
    }
  });
});
