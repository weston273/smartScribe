import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Camera, Settings, Award, BookOpen, Clock } from 'lucide-react';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import './Profile.css'

export default function Profile({ theme, toggleTheme }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: 'January 2024',
    bio: 'Passionate about learning and taking smart notes. Love using AI to enhance productivity and knowledge management.'
  });

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to a backend
  };

  const stats = [
    { icon: BookOpen, label: 'Notes Created', value: '127' },
    { icon: Award, label: 'Quizzes Completed', value: '43' },
    { icon: Clock, label: 'Hours Recorded', value: '28.5' },
    { icon: Settings, label: 'AI Summaries', value: '89' }
  ];

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />

      <div className="profile-body">
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="profile-main">
          <div className="profile-header">
            <h1 className="profile-title">Profile</h1>
            <button 
              className="edit-profile-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 size={20} />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="profile-content">
            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  <User size={48} />
                  <button className="avatar-edit-btn">
                    <Camera size={16} />
                  </button>
                </div>
                <div className="profile-basic-info">
                  {isEditing ? (
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                      className="edit-input name-input"
                    />
                  ) : (
                    <h2 className="profile-name">{userInfo.name}</h2>
                  )}
                  <p className="profile-member-since">Member since {userInfo.joinDate}</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <Mail size={20} className="detail-icon" />
                  <div className="detail-content">
                    <label>Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                        className="edit-input"
                      />
                    ) : (
                      <span>{userInfo.email}</span>
                    )}
                  </div>
                </div>

                <div className="detail-item">
                  <Phone size={20} className="detail-icon" />
                  <div className="detail-content">
                    <label>Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                        className="edit-input"
                      />
                    ) : (
                      <span>{userInfo.phone}</span>
                    )}
                  </div>
                </div>

                <div className="detail-item">
                  <MapPin size={20} className="detail-icon" />
                  <div className="detail-content">
                    <label>Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userInfo.location}
                        onChange={(e) => setUserInfo({...userInfo, location: e.target.value})}
                        className="edit-input"
                      />
                    ) : (
                      <span>{userInfo.location}</span>
                    )}
                  </div>
                </div>

                <div className="detail-item bio-item">
                  <User size={20} className="detail-icon" />
                  <div className="detail-content">
                    <label>Bio</label>
                    {isEditing ? (
                      <textarea
                        value={userInfo.bio}
                        onChange={(e) => setUserInfo({...userInfo, bio: e.target.value})}
                        className="edit-textarea"
                        rows="3"
                      />
                    ) : (
                      <p>{userInfo.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="profile-actions">
                  <button className="save-btn" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="stats-section">
              <h3 className="stats-title">Your Activity</h3>
              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-icon">
                      <stat.icon size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-section">
              <h3 className="activity-title">Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">
                    <BookOpen size={20} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">Created a new note: "Meeting with Alice"</p>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <Award size={20} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">Completed quiz: "JavaScript Fundamentals"</p>
                    <span className="activity-time">1 day ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <Clock size={20} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">Recorded 45 minutes of audio notes</p>
                    <span className="activity-time">2 days ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">
                    <Settings size={20} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">Generated AI summary for research notes</p>
                    <span className="activity-time">3 days ago</span>
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