import { Language } from '../types';

export const translations = {
  app_name: {
    en: 'Smart Soil Health',
    mr: 'स्मार्ट सॉईल हेल्थ',
    hi: 'स्मार्ट सॉयल हेल्थ'
  },
  tagline: {
    en: 'IoT Soil Reader & Farming Assistant',
    mr: 'माती परीक्षण व कृषी सल्लागार',
    hi: 'मृदा परीक्षण एवं कृषि सलाहकार'
  },
  nav_dashboard: {
    en: 'Dashboard',
    mr: 'डॅशबोर्ड',
    hi: 'डैशबोर्ड'
  },
  nav_test: {
    en: 'Soil Test',
    mr: 'माती चाचणी',
    hi: 'मृदा जांच'
  },
  nav_report: {
    en: 'Soil Report',
    mr: 'माती अहवाल',
    hi: 'मृदा रिपोर्ट'
  },
  nav_crops: {
    en: 'Crop Planner',
    mr: 'पीक नियोजन',
    hi: 'फसल योजना'
  },
  nav_farms: {
    en: 'My Plots',
    mr: 'माझी शेती',
    hi: 'मेरे खेत'
  },
  nav_device: {
    en: 'Device',
    mr: 'डिव्हाइस',
    hi: 'डिवाइस'
  },
  nav_market_weather: {
    en: 'Mandi & Weather',
    mr: 'बाजार व हवामान',
    hi: 'मंडी व मौसम'
  },
  nav_assistant: {
    en: 'AI Assistant',
    mr: 'कृषी सहाय्यक',
    hi: 'कृषि सहायक'
  },
  provenance_measured: {
    en: 'Measured (Raw Sensor)',
    mr: 'मोजलेले (सेन्सर डेटा)',
    hi: 'मापा गया (सेंसर डेटा)'
  },
  provenance_estimated: {
    en: 'Estimated (Calibrated Kit)',
    mr: 'अंदाजित (कॅलिब्रेटेड किट)',
    hi: 'अनुमानित (कैलिब्रेटेड किट)'
  },
  provenance_retrieved: {
    en: 'Retrieved (Govt Source)',
    mr: 'प्राप्त (शासकीय स्रोत)',
    hi: 'प्राप्त (सरकारी स्रोत)'
  },
  provenance_generated: {
    en: 'Generated (AI Explanation)',
    mr: 'जनरेट केलेले (AI सल्ला)',
    hi: 'जनरेटेड (AI सलाह)'
  },
  disclaimer_scientific: {
    en: 'Indicative screening only. Sensor measures chemical reaction color. Does not replace certified laboratory testing.',
    mr: 'फक्त सूचक तपासणी. सेन्सर रासायनिक अभिक्रिया रंग मोजतो. अधिकृत प्रयोगशाळेच्या चाचणीचा पर्याय नाही.',
    hi: 'केवल सांकेतिक जांच। सेंसर रासायनिक प्रतिक्रिया के रंग को मापता है। यह लैब परीक्षण का विकल्प नहीं है।'
  }
};

export function t(key: keyof typeof translations, lang: Language): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return key;
}
