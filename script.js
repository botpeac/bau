(() => {
  const fileInput = document.getElementById('fileInput');
  const loadButton = document.getElementById('loadButton');
  const contentDiv = document.getElementById('content');
  const showTextPosts = document.getElementById('showTextPosts');
  const showLinkPosts = document.getElementById('showLinkPosts');
  const sortBySelect = document.getElementById('sortBy');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const postCountDiv = document.getElementById('postCount');
  const loadingSpinner = document.getElementById('loadingSpinner');

  let posts = [];
  let filteredPosts = [];
  let currentPage = 1;
  const postsPerPage = 10;

  // Enable load button only when a file is selected
  fileInput.addEventListener('change', () => {
    loadButton.disabled = !fileInput.files.length;
  });

  loadButton.addEventListener('click', () => {
    if (!fileInput.files.length) return;

    posts = [];
    filteredPosts = [];
    currentPage = 1;
    contentDiv.innerHTML = '';
    postCountDiv.textContent = '';
    pageInfo.textContent = 'Loading...';
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;
    loadingSpinner.style.display = 'inline-block';

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const lines = reader.result.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          try {
            const post = JSON.parse(line);
            posts.push(post);
          } catch (e) {
            console.warn('Skipping invalid JSON line:', line);
          }
        }
        if (posts.length === 0) {
          contentDiv.textContent = 'No valid posts found in file.';
          pageInfo.textContent = 'Page 0 of 0';
          loadingSpinner.style.display = 'none';
          return;
        }
        applyFiltersAndRender();
      } catch (err) {
        contentDiv.textContent = 'Error reading file.';
        console.error(err);
      }
      loadingSpinner.style.display = 'none';
    };

    reader.onerror = () => {
      contentDiv.textContent = 'Error reading file.';
      loadingSpinner.style.display = 'none';
    };

    reader.readAsText(file);
  });

  function applyFiltersAndRender() {
    filteredPosts = posts.filter(post => {
      if (post.type === 'text' && !showTextPosts.checked) return false;
      if (post.type === 'link' && !showLinkPosts.checked) return false;
      return true;
    });

    sortPosts();
    renderPage();
  }

  function sortPosts() {
    switch (sortBySelect.value) {
      case 'dateDesc':
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'dateAsc':
        filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'scoreDesc':
        filteredPosts.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      case 'scoreAsc':
        filteredPosts.sort((a, b) => (a.score || 0) - (b.score || 0));
        break;
      case 'textLength':
        filteredPosts.sort((a, b) => {
          const lenA = a.text ? a.text.length : 0;
          const lenB = b.text ? b.text.length : 0;
          return lenB - lenA;
        });
        break;
    }
  }

  function renderPage() {
    const totalPosts = filteredPosts.length;
    const totalPages = Math.max(1, Math.ceil(totalPosts / postsPerPage));
    currentPage = Math.min(currentPage, totalPages);

    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    const pagePosts = filteredPosts.slice(start, end);

    contentDiv.innerHTML = '';
    if (pagePosts.length === 0) {
      contentDiv.textContent = 'No posts to display.';
    } else {
      for (const post of pagePosts) {
        contentDiv.appendChild(createPostElement(post));
      }
    }

    postCountDiv.textContent = `Showing ${pagePosts.length} of ${totalPosts} posts`;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
  }

  function createPostElement(post) {
    const div = document.createElement('div');
    div.classList.add('post');
    div.setAttribute('role', 'listitem');

    // Date
    const date = new Date(post.date);
    const dateStr = isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString();

    const header = document.createElement('h5');
    header.textContent = `Post ID: ${post.id || '(no id)'} — ${dateStr}`;
    div.appendChild(header);

    if (post.type === 'text') {
      const p = document.createElement('p');
      p.textContent = post.text || '(no text)';
      div.appendChild(p);
    } else if (post.type === 'link') {
      const a = document.createElement('a');
      a.href = post.link || '#';
      a.textContent = post.link || '(no link)';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      div.appendChild(a);

      if (post.text) {
        const desc = document.createElement('p');
        desc.textContent = post.text;
        div.appendChild(desc);
      }
    } else {
      const unknown = document.createElement('p');
      unknown.textContent = `Unknown post type: ${post.type}`;
      div.appendChild(unknown);
    }

    if (typeof post.score !== 'undefined') {
      const score = document.createElement('small');
      score.className = 'text-muted';
      score.textContent = `Score: ${post.score}`;
      div.appendChild(score);
    }

    return div;
  }

  // Event listeners for filters and pagination
  showTextPosts.addEventListener('change', () => {
    currentPage = 1;
    applyFiltersAndRender();
  });
  showLinkPosts.addEventListener('change', () => {
    currentPage = 1;
    applyFiltersAndRender();
  });
  sortBySelect.addEventListener('change', () => {
    currentPage = 1;
    applyFiltersAndRender();
  });
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
    }
  });
  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
    if (currentPage < totalPages) {
      currentPage++;
      renderPage();
    }
  });
})();
