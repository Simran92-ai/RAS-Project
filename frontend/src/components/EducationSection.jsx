import React, { useState } from 'react';
import './EducationSection.css';

const SECTIONS = [
  {
    title: 'What is Deadlock?',
    icon: '🔒',
    content: `A deadlock is a situation in an operating system where a set of processes are permanently blocked, each waiting for a resource held by another process in the group.

The four necessary conditions for deadlock (Coffman conditions):
  1. Mutual Exclusion — Resources cannot be shared simultaneously.
  2. Hold and Wait — Processes hold resources while waiting for others.
  3. No Preemption — Resources cannot be forcibly taken away.
  4. Circular Wait — A circular chain of processes exists, each waiting for a resource held by the next.

All four conditions must hold simultaneously for a deadlock to occur.`,
  },
  {
    title: 'Resource Allocation Graph',
    icon: '📊',
    content: `A Resource Allocation Graph (RAG) is a directed graph used to describe and detect deadlocks.

Nodes:
  • Process nodes — represented as circles
  • Resource nodes — represented as squares

Edges:
  • Request edge (P → R): Process P is waiting for Resource R
  • Assignment edge (R → P): Resource R is currently allocated to Process P

Deadlock detection:
  • If the RAG contains a cycle and each resource has exactly one instance, a deadlock exists.
  • For multi-instance resources, cycle detection alone is insufficient — Banker's Algorithm is needed.`,
  },
  {
    title: 'Deadlock Recovery',
    icon: '🛠',
    content: `When a deadlock is detected, the OS can resolve it using:

  1. Process Termination
     • Abort all deadlocked processes (costly), or
     • Abort one process at a time until the cycle is broken.

  2. Resource Preemption
     • Forcibly take resources from some processes and give them to others.
     • Requires careful rollback to avoid inconsistent states.

  3. Prevention (proactive)
     • Design the system to violate one of the four Coffman conditions.

  4. Avoidance — Banker's Algorithm
     • Dynamically check whether granting a request keeps the system in a "safe state".`,
  },
];

export default function EducationSection() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="edu-section">
      <div className="edu-header">
        <span className="card-title">📘 Learning Resources</span>
      </div>
      <div className="edu-list">
        {SECTIONS.map((sec, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} className={`edu-item ${isOpen ? 'edu-item--open' : ''}`}>
              <button
                className="edu-toggle"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="edu-icon">{sec.icon}</span>
                <span className="edu-title">{sec.title}</span>
                <span className="edu-chevron">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="edu-content">
                  <pre className="edu-text">{sec.content}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}