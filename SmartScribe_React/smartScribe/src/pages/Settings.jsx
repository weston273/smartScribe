import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download, 
  Trash2,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import './Settings.css'

export default function Settings({ theme, toggleTheme }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sound: true,
      reminders: true
    },
    privacy: {
      profileVisible: true,
      dataCollection: false,
      analytics: true
    },
    appearance: {
      theme: theme,
      fontSize: 'medium',
      language: 'en'
    },
    audio: {
      autoSave: true,
      quality: 'high',
      noiseReduction: true
    }
  });

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleThemeChange = (newTheme) => {
    updateSetting('appearance', 'theme', newTheme);
    toggleTheme();
  };

  const settingSections = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: User,
      items: [
        {
          type: 'button',
          label: 'Change Password',
          description: 'Update your account password',
          action: () => console.log('Change password')
        },
        {
          type: 'button',
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          action: () => console.log('Setup 2FA')
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          type: 'toggle',
          key: 'email',
          label: 'Email Notifications',
          description: 'Receive updates via email',
          value: settings.notifications.email
        },
        {
          type: 'toggle',
          key: 'push',
          label: 'Push Notifications',
          description: 'Get notified on your device',
          value: settings.notifications.push
        },
        {
          type: 'toggle',
          key: 'sound',
          label: 'Sound Notifications',
          description: 'Play sounds for notifications',
          value: settings.notifications.sound
        },
        {
          type: 'toggle',
          key: 'reminders',
          label: 'Study Reminders',
          description: 'Get reminded to review your notes',
          value: settings.notifications.reminders
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          type: 'toggle',
          key: 'profileVisible',
          label: 'Public Profile',
          description: 'Make your profile visible to others',
          value: settings.privacy.profileVisible
        },
        {
          type: 'toggle',
          key: 'dataCollection',
          label: 'Data Collection',
          description: 'Allow anonymous usage data collection',
          value: settings.privacy.dataCollection
        },
        {
          type: 'toggle',
          key: 'analytics',
          label: 'Analytics',
          description: 'Help improve the app with usage analytics',
          value: settings.privacy.analytics
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          type: 'select',
          key: 'fontSize',
          label: 'Font Size',
          description: 'Choose your preferred text size',
          value: settings.appearance.fontSize,
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' }
          ]
        },
        {
          type: 'theme',
          label: 'Theme',
          description: 'Choose between light and dark mode',
          value: settings.appearance.theme
        }
      ]
    },
    {
      id: 'audio',
      title: 'Audio Settings',
      icon: Volume2,
      items: [
        {
          type: 'toggle',
          key: 'autoSave',
          label: 'Auto-save Recordings',
          description: 'Automatically save your recordings',
          value: settings.audio.autoSave
        },
        {
          type: 'select',
          key: 'quality',
          label: 'Recording Quality',
          description: 'Choose audio recording quality',
          value: settings.audio.quality,
          options: [
            { value: 'low', label: 'Low (Smaller files)' },
            { value: 'medium', label: 'Medium (Balanced)' },
            { value: 'high', label: 'High (Best quality)' }
          ]
        },
        {
          type: 'toggle',
          key: 'noiseReduction',
          label: 'Noise Reduction',
          description: 'Reduce background noise in recordings',
          value: settings.audio.noiseReduction
        }
      ]
    }
  ];

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />

      <div className="settings-body">
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="settings-main">
          <div className="settings-header">
            <h1 className="settings-title">
              <SettingsIcon size={32} />
              Settings
            </h1>
            <p className="settings-subtitle">Customize your SmartScribe experience</p>
          </div>

          <div className="settings-content">
            {settingSections.map(section => (
              <div key={section.id} className="settings-section">
                <div className="section-header">
                  <section.icon size={24} className="section-icon" />
                  <h2 className="section-title">{section.title}</h2>
                </div>

                <div className="section-items">
                  {section.items.map((item, index) => (
                    <div key={index} className="setting-item">
                      <div className="setting-info">
                        <h3 className="setting-label">{item.label}</h3>
                        <p className="setting-description">{item.description}</p>
                      </div>

                      <div className="setting-control">
                        {item.type === 'toggle' && (
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={item.value}
                              onChange={(e) => updateSetting(section.id, item.key, e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        )}

                        {item.type === 'select' && (
                          <select
                            value={item.value}
                            onChange={(e) => updateSetting(section.id, item.key, e.target.value)}
                            className="setting-select"
                          >
                            {item.options.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {item.type === 'theme' && (
                          <div className="theme-selector">
                            <button
                              className={`theme-btn ${item.value === 'light' ? 'active' : ''}`}
                              onClick={() => handleThemeChange('light')}
                            >
                              <Sun size={20} />
                              Light
                            </button>
                            <button
                              className={`theme-btn ${item.value === 'dark' ? 'active' : ''}`}
                              onClick={() => handleThemeChange('dark')}
                            >
                              <Moon size={20} />
                              Dark
                            </button>
                          </div>
                        )}

                        {item.type === 'button' && (
                          <button className="setting-button" onClick={item.action}>
                            Configure
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Data Management Section */}
            <div className="settings-section danger-section">
              <div className="section-header">
                <Trash2 size={24} className="section-icon danger-icon" />
                <h2 className="section-title">Data Management</h2>
              </div>

              <div className="section-items">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-label">Export Data</h3>
                    <p className="setting-description">Download all your notes and recordings</p>
                  </div>
                  <div className="setting-control">
                    <button className="setting-button export-btn">
                      <Download size={18} />
                      Export
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="setting-label danger-label">Delete Account</h3>
                    <p className="setting-description">Permanently delete your account and all data</p>
                  </div>
                  <div className="setting-control">
                    <button className="setting-button danger-btn">
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showAccountDropdown && (
        <AccountDropDown theme={theme} onClose={handleCloseDropdown} />
      )}

      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}