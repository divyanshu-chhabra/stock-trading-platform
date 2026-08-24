import React from 'react';
import NewsFeed from '../../components/News/NewsFeed';
import './NewsPage.css';

const NewsPage = () => {
  return (
    <div className="news-page-container">
      <div className="news-page-header">
        <h1>Financial & Market News</h1>
        <p>Stay ahead with real-time news coverage, earnings reports, and macroeconomic analysis.</p>
      </div>

      <NewsFeed limit={20} compact={false} showCategoryFilter={true} title="All Market Coverage" />
    </div>
  );
};

export default NewsPage;
