import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Camera,
  Settings,
  Award,
  BookOpen,
  Clock,
} from "lucide-react";
import NavBar1 from "../components/NavBar1";
import SideBar from "../components/sidebar/SideBar.jsx";
import Footer from "../components/Footer";
import AccountDropDown from "../components/account/AccountDropDown.jsx";
import { supabase } from './../database/supabaseClient.js';
import "./Profile.css";

export default function Profile({ theme, toggleTheme }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    joinDate: "",
  });

  // ✅ Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No logged in user");
        return;
      }

      const { data, error } = await supabase
        .from("profiles_page")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // If profile doesn't exist yet, create one using sign-up metadata
      if (error && error.code === "PGRST116") {
        const meta = user.user_metadata || {};
        const firstname = meta.firstname || "";
        const lastname = meta.lastname || "";
        const fullName = `${firstname} ${lastname}`.trim();

        const { error: insertError } = await supabase.from("profiles_page").insert([
          {
            user_id: user.id,
            name: fullName,
            email: user.email,
            created_at: new Date(),
          },
        ]);

        if (insertError) console.error("Error creating new profile:", insertError);
        else console.log("Profile created for new user");
      } else if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      // ✅ Update UI state
      if (data) {
        const [firstname, lastname] = (data.name || "").split(" ");
        setUserInfo({
          firstname: firstname || "",
          lastname: lastname || "",
          email: data.email || user.email,
          phone: data.phone || "",
          location: data.location || "",
          bio: data.bio || "",
          joinDate: new Date(data.created_at).toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
        });
      }
    };

    fetchProfile();
  }, []);

  // ✅ Save edited data
  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to save your profile.");
      return;
    }

    const fullName = `${userInfo.firstname} ${userInfo.lastname}`.trim();

    const { error } = await supabase
      .from("profiles_page")
      .update({
        name: fullName,
        email: userInfo.email,
        phone: userInfo.phone,
        location: userInfo.location,
        bio: userInfo.bio,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating profile:", error.message);
      alert("Error saving profile: " + error.message);
    } else {
      alert("Profile updated successfully!");
      setIsEditing(false);
    }
  };

  const toggleSideBar = () => setShowSideBar((prev) => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown((prev) => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  const stats = [
    { icon: BookOpen, label: "Notes Created", value: "127" },
    { icon: Award, label: "Quizzes Completed", value: "43" },
    { icon: Clock, label: "Hours Recorded", value: "28.5" },
    { icon: Settings, label: "AI Summaries", value: "89" },
  ];

  return (
    <div className="page-wrapper">
      <NavBar1
        theme={theme}
        onSideBarToggle={toggleSideBar}
        onProfileClick={toggleAccountDropdown}
      />

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
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div className="profile-content">
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
                    <>
                      <input
                        type="text"
                        value={userInfo.firstname}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, firstname: e.target.value })
                        }
                        className="edit-input name-input"
                        placeholder="First name"
                      />
                      <input
                        type="text"
                        value={userInfo.lastname}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, lastname: e.target.value })
                        }
                        className="edit-input name-input"
                        placeholder="Last name"
                      />
                    </>
                  ) : (
                    <h2 className="profile-name">
                      {userInfo.firstname} {userInfo.lastname}
                    </h2>
                  )}
                  <p className="profile-member-since">
                    Member since {userInfo.joinDate || "—"}
                  </p>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <Mail size={20} className="detail-icon" />
                  <div className="detail-content">
                    <label>Email</label>
                    <span>{userInfo.email}</span>
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
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, phone: e.target.value })
                        }
                        className="edit-input"
                      />
                    ) : (
                      <span>{userInfo.phone || "—"}</span>
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
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, location: e.target.value })
                        }
                        className="edit-input"
                      />
                    ) : (
                      <span>{userInfo.location || "—"}</span>
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
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, bio: e.target.value })
                        }
                        className="edit-textarea"
                        rows="3"
                      />
                    ) : (
                      <p>{userInfo.bio || "No bio yet."}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="profile-actions">
                  <button className="save-btn" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Stats Section */}
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
