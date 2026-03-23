const POSTS = [
  {
    id: 1,
    title: "Test post, please ignore?",
    excerpt: "Excerpt test!",
    date: "Mar 23, 2025",
    tags: ["test"],
    featured: false,
    content: `
      <h2>Test post, please ignore?</h2>
      <p>Wow what a post.</p>
      <p>Here's some code:</p>
      <pre><code>function createUser(
        string $name,
        string $email,
        bool   $verified = false,
      ): User {
        return new User(
            name:     $name,
            email:    $email,
            verified: $verified
        );
      }</code></pre>
    `
  },
  {
  id: 2,
    title: "Another post to ignore lol",
    excerpt: "Excerpt test!??",
    date: "Mar 23, 2026",
    tags: ["test"],
    featured: false,
    content: `
      no html in this post.
    `
  },
  {
  id: 3,
    title: "They just keep coming",
    excerpt: "Still looking for excerpts.",
    date: "May 11, 2026",
    tags: ["test", "tag-with-meaning"],
    featured: false,
    content: `
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
    `
  },
  {
  id: 4,
    title: "We need more bento business!",
    excerpt: "Still looking for excerpts.",
    date: "Jun 03, 2026",
    tags: ["test"],
    featured: false,
    content: `
      <p>All tests done I think :D</p>
    `
  },
];

/* extract tags */
const ALL_TAGS = [...new Set(POSTS.flatMap(p => p.tags))].sort();

/* state */
let activeTag    = null;
let searchQuery  = '';
let currentPosts = [...POSTS];

/* navigation tags */
function renderNavTags() {
  const wrap = document.getElementById('nav-tags');
  wrap.innerHTML = ALL_TAGS.map(t =>
    `<button class="nav-tag${activeTag === t ? ' active' : ''}" onclick="filterTag('${t}')">${t}</button>`
  ).join('');
}

/* tag filter */
function filterTag(tag) {
  activeTag   = activeTag === tag ? null : tag;
  searchQuery = '';
  document.getElementById('search-input').value = '';
  renderNavTags();
  applyFilters();
}

function applyFilters() {
  const q = searchQuery.toLowerCase();
  currentPosts = POSTS.filter(p => {
    const matchTag    = !activeTag || p.tags.includes(activeTag);
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q));
    return matchTag && matchSearch;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
  renderGrid();
  updateLabel();
}

function updateLabel() {
  document.getElementById('section-label').textContent =
    activeTag ? `#${activeTag}` : searchQuery ? 'Search results' : 'All posts';
  const n = currentPosts.length;
  document.getElementById('posts-count').textContent = `${n} post${n !== 1 ? 's' : ''}`;
}

/* render grid */
function cardClass(posts, i) {
  if (posts.length === 1) return 'full';
  if (i === 0 && posts[i].featured) return 'featured';
  if (i === 1 && posts[0]?.featured) return 'secondary';
  if (i >= 2 && i <= 4) return 'third';
  return 'full';
}

function renderGrid() {
  const grid = document.getElementById('posts-grid');
  if (currentPosts.length === 0) {
    grid.innerHTML = `<div class="no-results">
      <div class="no-results-title">No posts found</div>
      <div class="no-results-sub">Try a different search or topic filter.</div>
    </div>`;
    return;
  }
  grid.innerHTML = currentPosts.map((p, i) => {
    const cls     = cardClass(currentPosts, i);
    const tagHtml = p.tags.map((t, ti) =>
      `<span class="card-tag${ti === 0 ? ' accent' : ''}">${t}</span>`
    ).join('');
    return `
      <article class="post-card ${cls}" style="--i:${i}" onclick="openPost(${p.id})">
        <div class="card-meta">
          ${tagHtml}
          <span class="card-date">${p.date}</span>
        </div>
        <h2 class="card-title">${p.title}</h2>
        <p class="card-excerpt">${p.excerpt}</p>
        <div class="card-footer">
          <div class="card-arrow">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M2 12L12 2M12 2H6M12 2v6"/>
            </svg>
          </div>
        </div>
      </article>`;
  }).join('');
}

/* post overlay */
function openPost(id) {
  const post = POSTS.find(p => p.id === id);
  if (!post) return;
  const tags = post.tags.map(t =>
    `<span class="card-tag accent" style="cursor:pointer" onclick="closePost();filterTag('${t}')">${t}</span>`
  ).join(' ');
  document.getElementById('article-content').innerHTML = `
    <div class="article-label">${tags}</div>
    <h1 class="article-title">${post.title}</h1>
    <div class="article-byline">
      <span class="author">Admin</span>
      <span>·</span><span>${post.date}</span>
    </div>
    <div class="article-body">${post.content}</div>
  `;
  const overlay = document.getElementById('overlay');
  overlay.classList.add('open');
  overlay.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  document.getElementById('read-progress').style.width = '0';
  history.pushState({ postId: id }, '', `#post-${id}`);
}

function closePost() {
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
  history.pushState({}, '', location.pathname);
}

function showHome() {
  activeTag   = null;
  searchQuery = '';
  document.getElementById('search-input').value = '';
  renderNavTags();
  applyFilters();
  closePost();
}

/* progress bar */
document.getElementById('overlay').addEventListener('scroll', function () {
  const pct = (this.scrollTop / (this.scrollHeight - this.clientHeight)) * 100;
  document.getElementById('read-progress').style.width = Math.min(pct, 100) + '%';
});

/* search */
let searchTimer;
document.getElementById('search-input').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = e.target.value.trim();
    activeTag   = null;
    renderNavTags();
    applyFilters();
  }, 200);
});

/* close overlay */
document.getElementById('overlay-close').addEventListener('click', closePost);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePost(); });

/* scroll to top */
const scrollBtn = document.getElementById('scroll-top');
window.addEventListener('scroll', () => {
  scrollBtn.classList.toggle('show', window.scrollY > 400);
}, { passive: true });
scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* initialize */
renderNavTags();
applyFilters();

const hashMatch = location.hash.match(/^#post-(\d+)$/);
if (hashMatch) openPost(parseInt(hashMatch[1]));
