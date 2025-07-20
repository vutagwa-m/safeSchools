import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageProvider';
import '../styles/LanguageSelector.css';

const LanguageSelector = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <div className="language-selector">
      <label htmlFor="language">🌐 Language:</label>
      <select
        id="language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="sw">Kiswahili</option>
        <option value="sh">Sheng</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
