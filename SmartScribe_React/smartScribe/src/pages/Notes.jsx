import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  MenuIcon,
  EditIcon,
  TrashIcon,
  QuestionIcon,
  NotesIcon,
} from "../components/icons/Icons";
import NavBar1 from "../components/NavBar1";
import SideBar from "../components/sidebar/SideBar.jsx";
import Footer from "../components/Footer";
import AccountDropDown from "../components/account/AccountDropDown.jsx";
import { useLanguage } from "../components/contexts/LanguageContext";
import { supabase } from "../database/supabaseClient.js";
import { useAuth } from "../components/contexts/AuthContext";
import "./Notes.css";

export default function Notes({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  // STATE
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("smartscribe-notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedNoteForQuiz, setSelectedNoteForQuiz] = useState(null);
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("notesViewMode") || "list"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // 🧩 Merge helper for local/cloud sync
  const mergeNotes = (local, cloud) => {
    const map = new Map();
    [...local, ...cloud].forEach((n) => map.set(n.id, n));
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.updated_at || b.updatedAt) -
        new Date(a.updated_at || a.updatedAt)
    );
  };

  // ✅ Fetch notes when user logs in
  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
        return;
      }

      const localNotes = JSON.parse(
        localStorage.getItem("smartscribe-notes") || "[]"
      );
      const merged = mergeNotes(localNotes, data);
      setNotes(merged);
      localStorage.setItem("smartscribe-notes", JSON.stringify(merged));
    };

    fetchNotes();
  }, [user]);

  // ✅ Real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          const { data } = await supabase
            .from("notes")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });
          setNotes(data);
          localStorage.setItem("smartscribe-notes", JSON.stringify(data));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // ✅ Persist view + notes
  useEffect(() => {
    localStorage.setItem("notesViewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("smartscribe-notes", JSON.stringify(notes));
  }, [notes]);

  // 🗑 Delete note
  const deleteNote = async (noteId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(t("notes.deleteConfirm") || "Delete this note?")) return;

    if (user) {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", user.id);
      if (error) console.error("Error deleting note:", error);
    }

    setNotes((prev) => prev.filter((n) => String(n.id) !== String(noteId)));
  };

  // 📚 Search + group
  const filteredNotes = notes.filter(
    (n) =>
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupNotesByDate = (notes) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    const groups = { today: [], yesterday: [], thisWeek: [], older: [] };

    notes.forEach((n) => {
      const d = new Date(n.created_at || n.createdAt);
      if (d.toDateString() === today.toDateString()) groups.today.push(n);
      else if (d.toDateString() === yesterday.toDateString())
        groups.yesterday.push(n);
      else if (d >= weekAgo) groups.thisWeek.push(n);
      else groups.older.push(n);
    });

    return groups;
  };

  const noteGroups = groupNotesByDate(filteredNotes);

  // 🧠 Quiz
  const handleQuizFromNote = (note, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNoteForQuiz(note);
    setShowQuizModal(true);
  };

  // 💅 UI Render helpers
  const renderNoteCard = (note) => (
    <div key={note.id} className={`note-card ${viewMode}`}>
      <Link to={`/notes/${note.id}`} className="note-link">
        <div className="note-content">
          <div className="note-header">
            <h3 className="note-title">{note.title}</h3>
            <div className="note-meta">
              <span>
                {new Date(note.updated_at || note.updatedAt).toLocaleDateString()}
              </span>
              <span>
                {new Date(note.updated_at || note.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <p className="note-preview">
            {note.content.substring(0, viewMode === "grid" ? 120 : 200)}
            {note.content.length > (viewMode === "grid" ? 120 : 200) ? "..." : ""}
          </p>

          {note.tags && note.tags.length > 0 && (
            <div className="note-tags">
              {note.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="note-tag">
                  #{tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="note-tag more">+{note.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="note-actions">
        <Link
          to={`/notes/${note.id}/edit`}
          className="btn btn-icon btn-ghost btn-sm"
          title={t("notes.edit") || "Edit note"}
          onClick={(e) => e.stopPropagation()}
        >
          <EditIcon size={16} />
        </Link>
        <button
          onClick={(e) => handleQuizFromNote(note, e)}
          className="btn btn-icon btn-ghost btn-sm"
          title={t("notes.generateQuiz") || "Generate quiz"}
        >
          <QuestionIcon size={16} />
        </button>
        <button
          onClick={(e) => deleteNote(note.id, e)}
          className="btn btn-icon btn-ghost btn-sm delete-btn"
          title={t("notes.delete") || "Delete note"}
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );

  const renderNoteGroup = (title, notes) =>
    notes.length > 0 && (
      <section className="notes-section" key={title}>
        <h2 className="section-title">{title}</h2>
        <div className={`notes-grid ${viewMode}`}>{notes.map(renderNoteCard)}</div>
      </section>
    );

  return (
    <div className="page-wrapper">
      <NavBar1
        theme={theme}
        onSideBarToggle={() => setShowSideBar((p) => !p)}
        onProfileClick={() => setShowAccountDropdown((p) => !p)}
      />

      <div className="notes-body">
        {showSideBar && <SideBar theme={theme} onClose={() => setShowSideBar(false)} />}

        <main className="notes-main">
          {/* HEADER */}
          <div className="notes-header">
            <div className="notes-title-section">
              <div className="notes-title-group">
                <NotesIcon size={32} className="notes-icon" />
                <h1>{t("notes.title") || "Notes"}</h1>
                <span className="notes-count">({filteredNotes.length})</span>
              </div>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <MenuIcon size={16} />
                  <span className="view-label">List</span>
                </button>
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <div className="grid-icon">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <span className="view-label">Grid</span>
                </button>
              </div>
            </div>

            <div className="header-actions">
              <Link to="/settings" className="btn btn-icon btn-ghost">
                <SettingsIcon size={20} />
              </Link>
            </div>
          </div>

          {/* SEARCH */}
          <div className="search-container">
            <div className="search-wrapper">
              <SearchIcon size={20} className="search-icon" />
              <input
                type="text"
                placeholder={t("notes.searchPlaceholder") || "Search notes..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn btn-icon btn-ghost btn-sm clear-search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* NOTES */}
          <div className="notes-content">
            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                <NotesIcon size={64} className="empty-icon" />
                <h2>{t("notes.noNotes") || "No notes yet"}</h2>
                <p>
                  {t("notes.noNotesDesc") ||
                    "Create your first note to get started with SmartScribe."}
                </p>
                <Link to="/notes/new" className="btn btn-primary btn-lg">
                  <PlusIcon size={20} />{" "}
                  {t("notes.createFirstNote") || "Create Note"}
                </Link>
              </div>
            ) : (
              <div className="notes-sections">
                {renderNoteGroup(t("notes.today") || "Today", noteGroups.today)}
                {renderNoteGroup(
                  t("notes.yesterday") || "Yesterday",
                  noteGroups.yesterday
                )}
                {renderNoteGroup(
                  t("notes.thisWeek") || "This Week",
                  noteGroups.thisWeek
                )}
                {renderNoteGroup(t("notes.older") || "Older", noteGroups.older)}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* FAB */}
      <Link to="/notes/new" className="fab" title="New Note">
        <PlusIcon size={24} />
      </Link>

      {/* QUIZ MODAL */}
      {showQuizModal && selectedNoteForQuiz && (
        <div className="modal-overlay" onClick={() => setShowQuizModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generate Quiz</h3>
              <button
                onClick={() => setShowQuizModal(false)}
                className="btn btn-icon btn-ghost"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>
                Generate a quiz from "<strong>{selectedNoteForQuiz.title}</strong>
                "?
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowQuizModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowQuizModal(false);
                  navigate("/quiz", {
                    state: {
                      fromNotes: true,
                      noteContent: selectedNoteForQuiz.content,
                      noteTitle: selectedNoteForQuiz.title,
                    },
                  });
                }}
                className="btn btn-primary"
              >
                <QuestionIcon size={16} /> Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccountDropdown && (
        <AccountDropDown
          theme={theme}
          onClose={() => setShowAccountDropdown(false)}
        />
      )}

      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}
