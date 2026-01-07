import { useEffect, useState } from "react";
import "./Attendance.css";

const ATTENDANCE_KEY = "planly_attendance_data";

export default function Attendance() {
  const [subjects, setSubjects] = useState([]);
  const [target, setTarget] = useState(75); // ✅ user-defined target (percentage)

  const [showModal, setShowModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  /* LOAD */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(ATTENDANCE_KEY));
    if (stored) setSubjects(stored);
  }, []);

  /* SAVE */
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

    const percentage = (attended / total) * 100;

    if (percentage >= target) return "On Track";

    const needed = Math.ceil(
      ((target / 100) * total - attended) / (1 - target / 100)
    );

    return `Attend next ${needed} classes to get back on track`;
  };
  const getLeaveMessage = (attended, total) => {
  if (total === 0) return "";
  if ((attended / total) * 100 < target) {
    return "";
  }

  const maxLeaves = Math.floor(
    (attended * 100) / target - total
  );

  if (maxLeaves <= 0) {
    return "Do NOT leave the next class";
  }

  if (maxLeaves === 1) {
    return "You may leave the next class";
  }

  return `You may leave the next ${maxLeaves} classes`;
};


  const getStatusClass = (attended, total) => {
    if (total === 0) return "safe";
    return (attended / total) * 100 >= target ? "safe" : "danger";
  };

  const totalAttendance = (() => {
    const attended = subjects.reduce((s, x) => s + x.attended, 0);
    const total = subjects.reduce((s, x) => s + x.total, 0);
    if (total === 0) return 0;
    return Math.round((attended / total) * 100);
  })();
const ProgressRing = ({ percentage }) => {
  const radius = 22;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      {/* background ring */}
      <circle
        stroke="#e6e6e6"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />

      {/* progress ring */}
      <circle
        stroke="#14b8a6"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />

      {/* percentage text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="600"
        fill="#111"
      >
        {percentage}%
      </text>
    </svg>
  );
};

  return (
    <div className="attendance-page">
      <header className="top-bar">
        <h2
          style={{
            fontFamily: "Jura, sans-serif",
            fontSize: "22px",
            fontWeight: "600",
            color: "#000",
            margin: 0,
          }}
        >
          Attendance
        </h2>
      </header>

      {/* SUMMARY */}
      <div className="attendance-summary">
        <div>
          <p className="summary-percent">{totalAttendance}%</p>
          <p>Target: {target}%</p>
          <p>{todayDate}</p>
        </div>

        <button
          className="add-subject-btn"
          onClick={() => setShowModal(true)}
        >
          + Add Subject
        </button>
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
              <p className="leave-text">
              {getLeaveMessage(subject.attended, subject.total)}
              </p>
            </div>

            <div className="right">
              <ProgressRing percentage={Number(percent)} />

              <div className="actions">
                <button onClick={() => markPresent(subject)}>✓</button>
                <button onClick={() => markAbsent(subject)}>✕</button>
                <button>⋮</button>
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
