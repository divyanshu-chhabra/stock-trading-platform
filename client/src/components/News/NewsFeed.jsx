import React, { useState, useEffect } from 'react';
import { getMarketNews } from '../../api/stockApi';
import './NewsFeed.css';

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Recent';
  const now = Math.floor(Date.now() / 1000);
  const diffSecs = now - timestamp;

  if (diffSecs < 60) return 'Just now';
  const mins = Math.floor(diffSecs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NewsFeed = ({
  limit = 6,
  compact = false,
  showCategoryFilter = true,
  title = 'Market News & Insights'
}) => {
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = [
    { id: 'general', label: 'All' },
    { id: 'technology', label: 'Tech' },
    { id: 'business', label: 'Business' },
    { id: 'crypto', label: 'Crypto' }
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMarketNews(category);
        if (isMounted) {
          setNews(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Error loading market news:', err.message);
          setError('Could not load latest news.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNews();
    return () => {
      isMounted = false;
    };
  }, [category]);

  const displayedNews = news.slice(0, limit);

  return (
    <div className="news-feed-container">
      <div className="news-feed-header">
        <h3 className="news-feed-title">
          <span>📰</span> {title}
        </h3>

        {showCategoryFilter && (
          <div className="news-category-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`news-category-pill ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="news-loading-skeleton">Loading market news feed...</div>
      ) : error ? (
        <div className="news-loading-skeleton" style={{ color: '#ff6b6b' }}>{error}</div>
      ) : displayedNews.length === 0 ? (
        <div className="news-loading-skeleton">No news articles found for this category.</div>
      ) : compact ? (
        <div className="news-compact-list">
          {displayedNews.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-compact-item"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.headline}
                  className="news-compact-thumb"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="news-compact-content">
                <div className="news-compact-headline">{item.headline}</div>
                <div className="news-compact-meta">
                  <span className="news-source-badge">{item.source}</span>
                  <span className="news-time">{formatTimeAgo(item.datetime)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="news-grid">
          {displayedNews.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card"
            >
              {item.image && (
                <div className="news-card-image-wrap">
                  <img
                    src={item.image}
                    alt={item.headline}
                    className="news-card-image"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=60';
                    }}
                  />
                </div>
              )}
              <div className="news-card-body">
                <div className="news-meta-row">
                  <span className="news-source-badge">{item.source}</span>
                  <span className="news-time">{formatTimeAgo(item.datetime)}</span>
                </div>
                <h4 className="news-headline">{item.headline}</h4>
                {item.summary && <p className="news-summary">{item.summary}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
