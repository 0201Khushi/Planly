import { useEffect, useState } from "react";
import "./Attendance.css";

const ATTENDANCE_KEY = "planly_attendance_data";
const TARGET = 0.75;

export default
 function Attendance() {
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  // Load from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(ATTENDANCE_KEY));
    if (stored) setSubjects(stored);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(subjects));
  }, [subjects]);

  const updateSubject = (id, updated) => {
    setSubjects(prev =>
      prev.map(s => (s.id === id ? updated : s))
    );
  };

  const markPresent = subject => {
    updateSubject(subject.id, {
      ...subject,
      attended: subject.attended + 1,
      total: subject.total + 1
    });
  };

  const markAbsent = subject => {
    updateSubject(subject.id, {
      ...subject,
      total: subject.total + 1
    });
  };

  const confirmAddSubject = () => {
    if (!newSubjectName.trim()) return;

    setSubjects(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newSubjectName.trim(),
        attended: 0,
        total: 0
      }
    ]);

    setNewSubjectName("");
    setShowModal(false);
  };

  const getStatusText = (attended, total) => {
    if (total === 0) return "No classes yet";

    const p = attended / total;

    if (p >= TARGET) {
      return "On Track";
    }

    const needed = Math.ceil(
      (TARGET * total - attended) / (1 - TARGET)
    );

    return `Attend next ${needed} classes to get back on track`;
  };

  const getStatusClass = (attended, total) => {
    if (total === 0) return "safe";
    return attended / total >= TARGET ? "safe" : "danger";
  };

  const totalAttendance = (() => {
    const tAtt = subjects.reduce((s, x) => s + x.attended, 0);
    const tTot = subjects.reduce((s, x) => s + x.total, 0);
    if (tTot === 0) return 0;
    return Math.round((tAtt / tTot) * 100);
  })();

  return (
    <div className="attendance-page">
      <header className="top-bar">
      <h2 style={{
      fontFamily: "Jura, sans-serif",
      fontSize: "22px",
      fontWeight: "600",
      color: "#000",
      margin: 0,
    }}>Attendance</h2>
      </header>

      {/* SUMMARY */}
      <div className="attendance-summary">
        <div>
          <p className="summary-label">Total Attendance</p>
          <p className="summary-percent">{totalAttendance}%</p>
          <p>Target: 75%</p>
        </div>
        <div>
          <button
        className="add-subject-btn"
        onClick={() => setShowModal(true)}
         >+ Add Subject</button>
        </div>
      </div>

      {/* SUBJECT CARDS */}
      {subjects.map(subject => {
        const percent =
          subject.total === 0
            ? 0
            : ((subject.attended / subject.total) * 100).toFixed(1);

        return (
          <div
            key={subject.id}
            className={`subject-card ${getStatusClass(
              subject.attended,
              subject.total
            )}`}
          >
            <div className="left">
              <input
                className="subject-name"
                value={subject.name}
                onChange={e =>
                  updateSubject(subject.id, {
                    ...subject,
                    name: e.target.value
                  })
                }
              />

              <p className="count">
                Attendance: {subject.attended}/{subject.total}
              </p>

              <p className="status-text">
                {getStatusText(subject.attended, subject.total)}
              </p>
            </div>

            <div className="right">
              <div className="percent-ring">{percent}%</div>

              <div className="actions">
                <button
                  className="present"
                  onClick={() => markPresent(subject)}
                >
                  ✓
                </button>
                <button
                  className="absent"
                  onClick={() => markAbsent(subject)}
                >
                  ✕
                </button>
                <button className="more">⋮</button>
              </div>
            </div>
          </div>
        );
      })}

      {/* ADD SUBJECT MODAL */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
          >
            <h3>Add Subject</h3>

            <input
              type="text"
              placeholder="Subject name"
              value={newSubjectName}
              onChange={e => setNewSubjectName(e.target.value)}
              autoFocus
            />

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={confirmAddSubject}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
