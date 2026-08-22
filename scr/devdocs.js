const { createApp, ref, computed, onMounted, nextTick } = Vue;

createApp({
    setup() {
        const view = ref('list');
        const articles = ref([]);
        const currentArticle = ref(null);
        const loading = ref(false);
        const loadingContent = ref(false);
        const error = ref(null);
        const contentError = ref(null);
        const content = ref('');

        const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const extractTags = (body) => {
            const lines = body.replace(/\s+$/, '').split('\n');
            let tags = [];
            while (lines.length) {
                const line = lines[lines.length - 1].trim();
                if (!line) { lines.pop(); continue; }
                const tokens = line.split(/\s+/);
                if (tokens.length && tokens.every(t => /^#[^\s#]+$/.test(t))) {
                    tags = tokens.map(t => t.slice(1)).concat(tags);
                    lines.pop();
                    continue;
                }
                break;
            }
            return tags;
        };

        const extractCover = (body) => {
            const m = body.match(/!\[\[([^\]]+)\]\]|!\[[^\]]*\]\(([^)]+)\)/);
            if (!m) return { cover_type: null, cover_value: null };
            if (m[1]) return { cover_type: 'embed', cover_value: m[1].trim() };
            return { cover_type: 'url', cover_value: m[2].trim() };
        };

        const loadArticles = async () => {
            loading.value = true;
            error.value = null;
            try {
                const listRes = await fetch('devdocs/');
                if (!listRes.ok) throw new Error('Папка devdocs/ недоступна');
                const listHtml = await listRes.text();
                const dir = new DOMParser().parseFromString(listHtml, 'text/html');
                const files = Array.from(new Set(
                    Array.from(dir.querySelectorAll('a'))
                        .map(a => decodeURIComponent((a.getAttribute('href') || '').split('/').filter(Boolean).pop() || ''))
                        .filter(name => name.toLowerCase().endsWith('.md'))
                ));

                const loaded = await Promise.all(files.map(async (file) => {
                    const res = await fetch(`devdocs/${encodeURIComponent(file)}`);
                    if (!res.ok) return null;
                    const body = await res.text();
                    const lastModified = res.headers.get('Last-Modified');
                    const date = lastModified ? new Date(lastModified) : new Date();
                    const id = file.replace(/\.md$/i, '');
                    return {
                        id,
                        file,
                        title: id,
                        date: date.toISOString().slice(0, 10),
                        tags: extractTags(body),
                        ...extractCover(body),
                        raw: body
                    };
                }));

                articles.value = loaded.filter(Boolean).sort((a, b) => b.date.localeCompare(a.date));
            } catch (err) {
                error.value = { title: 'Не удалось загрузить статьи', message: `${err.message}. Убедитесь, что на сервере включён листинг папки devdocs/.` };
            } finally {
                loading.value = false;
            }
        };

        const coverSrc = (article) => {
            if (article.cover_type === 'embed') {
                return `devdocs/${encodeURIComponent(article.file)}_Attachments/${encodeURIComponent(article.cover_value)}`;
            }
            if (article.cover_type === 'url') {
                if (/^https?:\/\//i.test(article.cover_value)) return article.cover_value;
                return `devdocs/${article.cover_value}`;
            }
            return '';
        };

        const stripCover = (md, article) => {
            if (article.cover_type === 'embed') {
                const re = new RegExp('!\\[\\[\\s*' + escapeRegExp(article.cover_value) + '\\s*\\]\\]');
                return md.replace(re, '');
            }
            if (article.cover_type === 'url') {
                const re = new RegExp('!\\[[^\\]]*\\]\\(\\s*' + escapeRegExp(article.cover_value) + '\\s*\\)');
                return md.replace(re, '');
            }
            return md;
        };

        const stripTrailingTags = (md) => {
            const lines = md.replace(/\s+$/, '').split('\n');
            while (lines.length) {
                const line = lines[lines.length - 1].trim();
                if (!line) { lines.pop(); continue; }
                const tokens = line.split(/\s+/);
                if (tokens.length && tokens.every(t => /^#[^\s#]+$/.test(t))) {
                    lines.pop();
                    continue;
                }
                break;
            }
            return lines.join('\n');
        };

        const resolveEmbeds = (md, article) =>
            md.replace(/!\[\[([^\]]+)\]\]/g, (_, name) =>
                `![](devdocs/${encodeURIComponent(article.file)}_Attachments/${encodeURIComponent(name.trim())})`
            );

        const loadContent = async (article) => {
            loadingContent.value = true;
            contentError.value = null;
            content.value = '';
            try {
                let md = article.raw;
                if (md == null) {
                    const res = await fetch(`devdocs/${encodeURIComponent(article.file)}`);
                    if (!res.ok) throw new Error(`Файл "${article.file}" не найден`);
                    md = await res.text();
                }
                md = stripCover(md, article);
                md = stripTrailingTags(md);
                md = resolveEmbeds(md, article);
                const html = marked.parse(md, { gfm: true, breaks: true });
                content.value = html;
                nextTick(() => {
                    document.querySelectorAll('.markdown-body pre code').forEach(block => {
                        hljs.highlightElement(block);
                    });
                });
            } catch (err) {
                contentError.value = { title: 'Не удалось загрузить статью', message: err.message };
            } finally {
                loadingContent.value = false;
            }
        };

        const openArticle = (article) => {
            currentArticle.value = article;
            view.value = 'article';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            loadContent(article);
        };

        const closeArticle = () => {
            view.value = 'list';
            currentArticle.value = null;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        const renderedContent = computed(() => content.value);

        const formatDate = (dateStr) => {
            const d = new Date(dateStr);
            if (isNaN(d)) return dateStr;
            return d.toLocaleDateString('ru-RU', { day: 'numeric', month: '2-digit', year: 'numeric' });
        };

        onMounted(loadArticles);

        return {
            view, articles, currentArticle, loading, loadingContent, error, contentError,
            renderedContent, openArticle, closeArticle, coverSrc, formatDate
        };
    }
}).mount('#app');

const menuBtn = document.getElementById('menuBtn');
const glassMenu = document.getElementById('glassMenu');

function closeMenu() {
    menuBtn.classList.remove('active');
    glassMenu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
}

menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = glassMenu.classList.toggle('open');
    menuBtn.classList.toggle('active', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (e) => {
    if (!glassMenu.contains(e.target) && e.target !== menuBtn) closeMenu();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
});
