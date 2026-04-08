import React, { useState } from 'react';
import './MatrixTables.css';

function MatrixTable({ title, matrix, resources, highlight }) {
  if (!matrix || Object.keys(matrix).length === 0) return null;
  const procs = Object.keys(matrix);
  return (
    <div className="mt-table-wrap">
      <div className="mt-table-title">{title}</div>
      <div className="mt-scroll">
        <table className="mt-table">
          <thead>
            <tr>
              <th>Process</th>
              {resources.map(r => <th key={r}>{r}</th>)}
            </tr>
          </thead>
          <tbody>
            {procs.map(pid => (
              <tr key={pid} className={highlight?.includes(pid) ? 'mt-row--highlight' : ''}>
                <td className="mt-proc">{pid}</td>
                {resources.map(r => (
                  <td key={r} className={
                    matrix[pid]?.[r] > 0 ? 'mt-val mt-val--nonzero' : 'mt-val'
                  }>
                    {matrix[pid]?.[r] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MatrixTables({ graphData }) {
  const [collapsed, setCollapsed] = useState(false);

  const {
    detection_mode, alloc_matrix, need_matrix, max_matrix,
    available, safe_sequence, deadlocked_procs, adjacency_list,
  } = graphData;

  const isMulti = detection_mode === 'multi_instance';

  // Get resource names from alloc_matrix or available
  const resources = available && Object.keys(available).length > 0
    ? Object.keys(available)
    : alloc_matrix && Object.keys(alloc_matrix).length > 0
      ? Object.keys(Object.values(alloc_matrix)[0] || {})
      : [];

  const hasMatrices = isMulti && resources.length > 0;
  const hasAdjacency = adjacency_list && Object.keys(adjacency_list).length > 0;

  if (!hasMatrices && !hasAdjacency) return null;

  return (
    <div className="matrix-tables">
      <div className="mt-header" onClick={() => setCollapsed(c => !c)}>
        <span className="mt-header-title">
          📊 {isMulti ? "Banker's Algorithm Tables" : 'Adjacency List'}
        </span>
        <button className="mt-collapse-btn">{collapsed ? '▼ Show' : '▲ Hide'}</button>
      </div>

      {!collapsed && (
        <div className="mt-body">

          {/* ── Available Vector ── */}
          {isMulti && available && Object.keys(available).length > 0 && (
            <div className="mt-available">
              <div className="mt-table-title">Available Resources</div>
              <div className="mt-avail-chips">
                {Object.entries(available).map(([res, val]) => (
                  <div key={res} className="mt-avail-chip">
                    <span className="mt-avail-res">{res}</span>
                    <span className="mt-avail-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Matrices ── */}
          {hasMatrices && (
            <div className="mt-matrices">
              <MatrixTable
                title="Allocation Matrix"
                matrix={alloc_matrix}
                resources={resources}
                highlight={deadlocked_procs}
              />
              <MatrixTable
                title="Need Matrix (Max − Allocation)"
                matrix={need_matrix}
                resources={resources}
                highlight={deadlocked_procs}
              />
              {max_matrix && Object.keys(max_matrix).length > 0 && (
                <MatrixTable
                  title="Max Matrix"
                  matrix={max_matrix}
                  resources={resources}
                />
              )}
            </div>
          )}

          {/* ── Safe Sequence Table ── */}
          {safe_sequence?.length > 0 && (
            <div className="mt-safe-seq">
              <div className="mt-table-title">Safe Execution Sequence</div>
              <div className="mt-seq-row">
                {safe_sequence.map((p, i) => (
                  <React.Fragment key={i}>
                    <div className="mt-seq-step">
                      <span className="mt-seq-num">{i + 1}</span>
                      <span className="mt-seq-proc">{p}</span>
                    </div>
                    {i < safe_sequence.length - 1 && (
                      <span className="mt-seq-arrow">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* ── Adjacency List (single-instance) ── */}
          {!isMulti && hasAdjacency && (
            <div className="mt-adj">
              <div className="mt-table-title">Adjacency List</div>
              <div className="mt-scroll">
                <table className="mt-table">
                  <thead>
                    <tr><th>Node</th><th>→ Neighbors</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(adjacency_list).map(([node, neighbors]) => (
                      <tr key={node}>
                        <td className="mt-proc">{node}</td>
                        <td>
                          {neighbors.length > 0
                            ? neighbors.map((n, i) => (
                                <span key={i} className="mt-neighbor-chip">{n}</span>
                              ))
                            : <span className="mt-none">—</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
