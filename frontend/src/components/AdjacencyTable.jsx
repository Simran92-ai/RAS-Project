import React, { useState } from 'react';
import './AdjacencyTable.css';

export default function AdjacencyTable({ adjacencyList }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!adjacencyList || Object.keys(adjacencyList).length === 0) return null;

  const entries = Object.entries(adjacencyList);

  return (
    <div className="adj-card">
      <div className="adj-header" onClick={() => setCollapsed(c => !c)}>
        <span className="card-title">📋 Adjacency List Representation</span>
        <button className="adj-toggle">{collapsed ? '▼ Show' : '▲ Hide'}</button>
      </div>

      {!collapsed && (
        <div className="adj-body">
          <p className="adj-desc">
            Directed edges in the Resource Allocation Graph — each node lists its outgoing neighbors.
          </p>
          <div className="adj-table-wrap">
            <table className="adj-table">
              <thead>
                <tr>
                  <th>Node</th>
                  <th>→ Neighbors</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([node, neighbors], i) => (
                  <tr key={i} className={neighbors.length === 0 ? 'adj-row--empty' : ''}>
                    <td className="adj-node">{node}</td>
                    <td className="adj-neighbors">
                      {neighbors.length > 0 ? (
                        neighbors.map((n, j) => (
                          <span key={j} className="adj-chip">{n}</span>
                        ))
                      ) : (
                        <span className="adj-none">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}