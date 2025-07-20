import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageProvider';
import translations from '../utils/translations';
import '../styles/Home.css';  // Import external CSS

const Home = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  return (
    <main className="main-container">
      <h1 className="heading">{t.welcome}</h1>
      <p className="subheading">{t.description}</p>

      {/* Buttons Section */}
      <div className="buttons-container">
        <Link to="/report" className={`button report-button`}>
          {t.report}
        </Link>
        <Link to="/resources" className={`button resources-button`}>
          {t.resources}
        </Link>
        <Link to="/chat" className={`button gethelp-button`}>
          {t.getHelp}
        </Link>
      </div>

      {/* Resources Section */}
      <div className='contents'>
      <div className="section">
        <h2 className="section-title">{t.resources}</h2>
        <p className="section-description">
          {t.resourcesDescription}
        </p>
      </div>

      {/* Get Help Section */}
      <div className="section">
        <h2 className="section-title">{t.getHelp}</h2>
        <p className="section-description">
          {t.getHelpDescription}
        </p>
      </div>
      </div>
    </main>
  );
};

export default Home;
