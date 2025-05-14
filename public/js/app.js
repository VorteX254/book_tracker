document.addEventListener('DOMContentLoaded', () => {
    const appDiv = document.getElementById('app');
  
    // Intercept clicks on internal links
    document.body.addEventListener('click', async (e) => {
      if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const url = e.target.getAttribute('href');
        const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        const html = await res.text();
        appDiv.innerHTML = html;
        window.history.pushState({}, '', url);
      }
    });
  
    // Support back/forward browser buttons
    window.addEventListener('popstate', async () => {
      const res = await fetch(location.pathname, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      const html = await res.text();
      appDiv.innerHTML = html;
    });
});

document.body.addEventListener('click', async (e) => {
  if (e.target.matches('.delete-btn')) {
    const bookId = e.target.dataset.id;

    const confirmed = confirm("Are you sure you want to delete this book?");
    if (!confirmed) return;

    try {
      const res = await fetch('/books/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: bookId })
      });

      if (res.ok) {
        // Remove the book element from the DOM
        const li = e.target.closest('li');
        li.remove();
      } else {
        alert('Failed to delete the book.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting book.');
    }
  }
});