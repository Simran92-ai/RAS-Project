// // components/InputPanel.js
// import React, { useState, useCallback } from 'react';
// import './InputPanel.css';

// /* ── Default name generators ─────────────────────────── */
// const PROCESS_NAMES = ['Process A','Process B','Process C','Process D',
//   'Process E','Process F','Process G','Process H'];
// const RESOURCE_NAMES = ['Resource X','Resource Y','Resource Z','Resource W',
//   'Resource V','Resource U','Resource T','Resource S'];

// const defaultProcess = (i) => ({ id: `p${i}`, label: PROCESS_NAMES[i] || `Process ${i}` });
// const defaultResource = (i) => ({ id: `r${i}`, label: RESOURCE_NAMES[i] || `Resource ${i}` });

// export default function InputPanel({ onAnalyze, onLoadSample, loading }) {
//   const [numProcesses, setNumProcesses]  = useState(2);
//   const [numResources, setNumResources]  = useState(2);
//   const [processes, setProcesses]        = useState([defaultProcess(0), defaultProcess(1)]);
//   const [resources, setResources]        = useState([defaultResource(0), defaultResource(1)]);
//   const [requests, setRequests]          = useState([]);     // {process, resource}
//   const [allocations, setAllocations]    = useState([]);     // {resource, process}
//   const [newReq, setNewReq]              = useState({ process: 'p0', resource: 'r0' });
//   const [newAlloc, setNewAlloc]          = useState({ resource: 'r0', process: 'p0' });
//   const [validationErr, setValidationErr] = useState('');

//   /* ── Sync arrays when counts change ─────────────────── */
//   const handleNumProcesses = (val) => {
//     const n = Math.max(1, Math.min(10, Number(val)));
//     setNumProcesses(n);
//     setProcesses(Array.from({ length: n }, (_, i) =>
//       processes[i] || defaultProcess(i)
//     ));
//     // Remove edges that reference removed processes
//     const ids = new Set(Array.from({ length: n }, (_, i) => `p${i}`));
//     setRequests(prev => prev.filter(r => ids.has(r.process)));
//     setAllocations(prev => prev.filter(a => ids.has(a.process)));
//   };

//   const handleNumResources = (val) => {
//     const n = Math.max(1, Math.min(10, Number(val)));
//     setNumResources(n);
//     setResources(Array.from({ length: n }, (_, i) =>
//       resources[i] || defaultResource(i)
//     ));
//     const ids = new Set(Array.from({ length: n }, (_, i) => `r${i}`));
//     setRequests(prev => prev.filter(r => ids.has(r.resource)));
//     setAllocations(prev => prev.filter(a => ids.has(a.resource)));
//   };

//   const updateLabel = (type, idx, value) => {
//     if (type === 'process') {
//       setProcesses(prev => prev.map((p, i) => i === idx ? { ...p, label: value } : p));
//     } else {
//       setResources(prev => prev.map((r, i) => i === idx ? { ...r, label: value } : r));
//     }
//   };

//   /* ── Edge management ────────────────────────────────── */
//   const addRequest = () => {
//     const exists = requests.some(
//       r => r.process === newReq.process && r.resource === newReq.resource
//     );
//     if (exists) return;
//     setRequests(prev => [...prev, { ...newReq }]);
//   };

//   const addAllocation = () => {
//     const exists = allocations.some(
//       a => a.resource === newAlloc.resource && a.process === newAlloc.process
//     );
//     if (exists) return;
//     setAllocations(prev => [...prev, { ...newAlloc }]);
//   };

//   const removeRequest  = (i) => setRequests(prev => prev.filter((_, idx) => idx !== i));
//   const removeAllocation = (i) => setAllocations(prev => prev.filter((_, idx) => idx !== i));

//   /* ── Load sample data ───────────────────────────────── */
//   const handleSample = useCallback(async () => {
//     const sample = await onLoadSample();
//     if (!sample) return;
//     setNumProcesses(sample.processes.length);
//     setNumResources(sample.resources.length);
//     setProcesses(sample.processes);
//     setResources(sample.resources);
//     setRequests(sample.requests);
//     setAllocations(sample.allocations);
//     setNewReq({ process: sample.processes[0].id, resource: sample.resources[0].id });
//     setNewAlloc({ resource: sample.resources[0].id, process: sample.processes[0].id });
//   }, [onLoadSample]);

//   /* ── Reset ──────────────────────────────────────────── */
//   const handleReset = () => {
//     setNumProcesses(2); setNumResources(2);
//     setProcesses([defaultProcess(0), defaultProcess(1)]);
//     setResources([defaultResource(0), defaultResource(1)]);
//     setRequests([]); setAllocations([]);
//     setNewReq({ process: 'p0', resource: 'r0' });
//     setNewAlloc({ resource: 'r0', process: 'p0' });
//     setValidationErr('');
//   };

//   /* ── Submit ─────────────────────────────────────────── */
//   const handleSubmit = () => {
//     if (requests.length === 0 && allocations.length === 0) {
//       setValidationErr('Add at least one edge (request or allocation).');
//       return;
//     }
//     setValidationErr('');
//     onAnalyze({ processes, resources, requests, allocations });
//   };

//   /* ── Label lookup helpers ───────────────────────────── */
//   const procLabel = (id) => processes.find(p => p.id === id)?.label || id;
//   const resLabel  = (id) => resources.find(r => r.id === id)?.label  || id;

//   return (
//     <div className="input-panel">
//       {/* ── Node Count Section ────────────────────────── */}
//       <div className="ip-section">
//         <div className="ip-section-title">Nodes</div>
//         <div className="ip-count-row">
//           <label className="ip-count-label">
//             <span>Processes</span>
//             <div className="ip-stepper">
//               <button onClick={() => handleNumProcesses(numProcesses - 1)} disabled={numProcesses <= 1}>−</button>
//               <span>{numProcesses}</span>
//               <button onClick={() => handleNumProcesses(numProcesses + 1)} disabled={numProcesses >= 10}>+</button>
//             </div>
//           </label>
//           <label className="ip-count-label">
//             <span>Resources</span>
//             <div className="ip-stepper">
//               <button onClick={() => handleNumResources(numResources - 1)} disabled={numResources <= 1}>−</button>
//               <span>{numResources}</span>
//               <button onClick={() => handleNumResources(numResources + 1)} disabled={numResources >= 10}>+</button>
//             </div>
//           </label>
//         </div>
//       </div>

//       {/* ── Process Labels ───────────────────────────── */}
//       <div className="ip-section">
//         <div className="ip-section-title">
//           <span className="ip-dot ip-dot--process"></span>
//           Process Names
//         </div>
//         <div className="ip-labels-grid">
//           {processes.map((p, i) => (
//             <div key={p.id} className="ip-label-row">
//               <span className="ip-node-id">{p.id}</span>
//               <input
//                 className="ip-input"
//                 value={p.label}
//                 onChange={e => updateLabel('process', i, e.target.value)}
//                 placeholder={`Process ${i}`}
//               />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── Resource Labels ──────────────────────────── */}
//       <div className="ip-section">
//         <div className="ip-section-title">
//           <span className="ip-dot ip-dot--resource"></span>
//           Resource Names
//         </div>
//         <div className="ip-labels-grid">
//           {resources.map((r, i) => (
//             <div key={r.id} className="ip-label-row">
//               <span className="ip-node-id">{r.id}</span>
//               <input
//                 className="ip-input"
//                 value={r.label}
//                 onChange={e => updateLabel('resource', i, e.target.value)}
//                 placeholder={`Resource ${i}`}
//               />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── Request Edges ────────────────────────────── */}
//       <div className="ip-section">
//         <div className="ip-section-title">Request Edges <span className="ip-badge">(Process → Resource)</span></div>
//         <div className="ip-edge-add">
//           <select
//             className="ip-select"
//             value={newReq.process}
//             onChange={e => setNewReq(v => ({ ...v, process: e.target.value }))}
//           >
//             {processes.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
//           </select>
//           <span className="ip-arrow">→</span>
//           <select
//             className="ip-select"
//             value={newReq.resource}
//             onChange={e => setNewReq(v => ({ ...v, resource: e.target.value }))}
//           >
//             {resources.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
//           </select>
//           <button className="ip-add-btn" onClick={addRequest} title="Add request edge">+</button>
//         </div>
//         <div className="ip-edge-list">
//           {requests.length === 0 && (
//             <div className="ip-empty">No request edges yet</div>
//           )}
//           {requests.map((req, i) => (
//             <div key={i} className="ip-edge-chip ip-edge-chip--request">
//               <span>{procLabel(req.process)}</span>
//               <span className="ip-arrow-chip">→</span>
//               <span>{resLabel(req.resource)}</span>
//               <button onClick={() => removeRequest(i)} className="ip-remove">×</button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── Allocation Edges ─────────────────────────── */}
//       <div className="ip-section">
//         <div className="ip-section-title">Allocation Edges <span className="ip-badge">(Resource → Process)</span></div>
//         <div className="ip-edge-add">
//           <select
//             className="ip-select"
//             value={newAlloc.resource}
//             onChange={e => setNewAlloc(v => ({ ...v, resource: e.target.value }))}
//           >
//             {resources.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
//           </select>
//           <span className="ip-arrow">→</span>
//           <select
//             className="ip-select"
//             value={newAlloc.process}
//             onChange={e => setNewAlloc(v => ({ ...v, process: e.target.value }))}
//           >
//             {processes.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
//           </select>
//           <button className="ip-add-btn" onClick={addAllocation} title="Add allocation edge">+</button>
//         </div>
//         <div className="ip-edge-list">
//           {allocations.length === 0 && (
//             <div className="ip-empty">No allocation edges yet</div>
//           )}
//           {allocations.map((alloc, i) => (
//             <div key={i} className="ip-edge-chip ip-edge-chip--alloc">
//               <span>{resLabel(alloc.resource)}</span>
//               <span className="ip-arrow-chip">→</span>
//               <span>{procLabel(alloc.process)}</span>
//               <button onClick={() => removeAllocation(i)} className="ip-remove">×</button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── Validation Error ─────────────────────────── */}
//       {validationErr && (
//         <div className="ip-validation-err">{validationErr}</div>
//       )}

//       {/* ── Action Buttons ───────────────────────────── */}
//       <div className="ip-actions">
//         <button
//           className="ip-btn ip-btn--primary"
//           onClick={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? (
//             <><span className="ip-spinner"></span> Analyzing…</>
//           ) : (
//             <><span>⬡</span> Generate Graph</>
//           )}
//         </button>
//         <button className="ip-btn ip-btn--secondary" onClick={handleSample}>
//           ⚡ Sample Data
//         </button>
//         <button className="ip-btn ip-btn--ghost" onClick={handleReset}>
//           ↺ Reset
//         </button>
//       </div>
//     </div>
//   );
// }







// components/InputPanel.js — Extended
// - No limit on processes/resources
// - Resources have category + instances
// - Dynamic add/remove for both
import React, { useState, useCallback } from 'react';
import './InputPanel.css';

const CATEGORIES = ['CPU', 'Memory', 'I/O Device', 'File', 'Network'];
const PROCESS_NAMES  = ['Process A','Process B','Process C','Process D','Process E',
                        'Process F','Process G','Process H','Process I','Process J'];
const RESOURCE_NAMES = ['Resource X','Resource Y','Resource Z','Resource W',
                        'Resource V','Resource U','Resource T','Resource S'];

const mkProcess  = (i) => ({ id: `p${i}`, label: PROCESS_NAMES[i] || `Process ${i}` });
const mkResource = (i) => ({
  id: `r${i}`, label: RESOURCE_NAMES[i] || `Resource ${i}`,
  category: 'CPU', instances: 1,
});

export default function InputPanel({ onAnalyze, onLoadSample, loading }) {
  const [processes,   setProcesses]   = useState([mkProcess(0), mkProcess(1)]);
  const [resources,   setResources]   = useState([mkResource(0), mkResource(1)]);
  const [requests,    setRequests]    = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [maxDemand,   setMaxDemand]   = useState([]);
  const [showMax,     setShowMax]     = useState(false);
  const [newReq,      setNewReq]      = useState({ process: 'p0', resource: 'r0' });
  const [newAlloc,    setNewAlloc]    = useState({ resource: 'r0', process: 'p0', instances: 1 });
  const [newMax,      setNewMax]      = useState({ process: 'p0', resource: 'r0', instances: 1 });
  const [validErr,    setValidErr]    = useState('');

  const isMulti = resources.some(r => parseInt(r.instances) > 1);

  // ── Process management ────────────────────────────────────────
  const addProcess = () => {
    const i = processes.length;
    setProcesses(prev => [...prev, mkProcess(i)]);
  };
  const removeProcess = (idx) => {
    const pid = processes[idx].id;
    setProcesses(prev => prev.filter((_, i) => i !== idx));
    setRequests(prev => prev.filter(r => r.process !== pid));
    setAllocations(prev => prev.filter(a => a.process !== pid));
    setMaxDemand(prev => prev.filter(m => m.process !== pid));
  };
  const updateProcess = (idx, val) =>
    setProcesses(prev => prev.map((p, i) => i === idx ? { ...p, label: val } : p));

  // ── Resource management ───────────────────────────────────────
  const addResource = () => {
    const i = resources.length;
    setResources(prev => [...prev, mkResource(i)]);
  };
  const removeResource = (idx) => {
    const rid = resources[idx].id;
    setResources(prev => prev.filter((_, i) => i !== idx));
    setRequests(prev => prev.filter(r => r.resource !== rid));
    setAllocations(prev => prev.filter(a => a.resource !== rid));
    setMaxDemand(prev => prev.filter(m => m.resource !== rid));
  };
  const updateResource = (idx, field, val) =>
    setResources(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));

  // ── Edge management ───────────────────────────────────────────
  const addRequest = () => {
    if (requests.some(r => r.process === newReq.process && r.resource === newReq.resource)) return;
    setRequests(prev => [...prev, { ...newReq }]);
  };
  const addAllocation = () => {
    if (allocations.some(a => a.resource === newAlloc.resource && a.process === newAlloc.process)) return;
    setAllocations(prev => [...prev, { ...newAlloc }]);
  };
  const addMaxDemand = () => {
    setMaxDemand(prev => {
      const exists = prev.findIndex(m => m.process === newMax.process && m.resource === newMax.resource);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = { ...newMax };
        return updated;
      }
      return [...prev, { ...newMax }];
    });
  };

  const pLabel = (id) => processes.find(p => p.id === id)?.label || id;
  const rLabel = (id) => {
    const r = resources.find(r => r.id === id);
    return r ? r.label : id;
  };

  // ── Load sample ───────────────────────────────────────────────
  const handleSample = useCallback(async (type) => {
    const s = await onLoadSample(type);
    if (!s) return;
    setProcesses(s.processes);
    setResources(s.resources.map(r => ({
      ...r, category: r.category || 'CPU', instances: r.instances || 1
    })));
    setRequests(s.requests);
    setAllocations(s.allocations);
    setMaxDemand(s.max_demand || []);
    setShowMax((s.max_demand || []).length > 0);
    if (s.processes[0]) setNewReq({ process: s.processes[0].id, resource: s.resources[0].id });
    if (s.resources[0]) setNewAlloc({ resource: s.resources[0].id, process: s.processes[0].id, instances: 1 });
  }, [onLoadSample]);

  const handleReset = () => {
    setProcesses([mkProcess(0), mkProcess(1)]);
    setResources([mkResource(0), mkResource(1)]);
    setRequests([]); setAllocations([]); setMaxDemand([]);
    setValidErr(''); setShowMax(false);
    setNewReq({ process: 'p0', resource: 'r0' });
    setNewAlloc({ resource: 'r0', process: 'p0', instances: 1 });
    setNewMax({ process: 'p0', resource: 'r0', instances: 1 });
  };

  const handleSubmit = () => {
    if (requests.length === 0 && allocations.length === 0) {
      setValidErr('Add at least one edge.'); return;
    }
    setValidErr('');
    onAnalyze({ processes, resources, requests, allocations, max_demand: maxDemand });
  };

  return (
    <div className="input-panel">

      {/* ── Processes ── */}
      <div className="ip-section">
        <div className="ip-section-header">
          <div className="ip-section-title">
            <span className="ip-dot ip-dot--process"></span> Processes
          </div>
          <button className="ip-add-node-btn" onClick={addProcess}>+ Add</button>
        </div>
        <div className="ip-labels-grid">
          {processes.map((p, i) => (
            <div key={p.id} className="ip-label-row">
              <span className="ip-node-id">{p.id}</span>
              <input
                className="ip-input"
                value={p.label}
                onChange={e => updateProcess(i, e.target.value)}
                placeholder={`Process ${i}`}
              />
              {processes.length > 1 && (
                <button className="ip-remove-node" onClick={() => removeProcess(i)} title="Remove">×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Resources ── */}
      <div className="ip-section">
        <div className="ip-section-header">
          <div className="ip-section-title">
            <span className="ip-dot ip-dot--resource"></span> Resources
          </div>
          <button className="ip-add-node-btn" onClick={addResource}>+ Add</button>
        </div>
        <div className="ip-res-grid">
          {resources.map((r, i) => (
            <div key={r.id} className="ip-res-row">
              <span className="ip-node-id">{r.id}</span>
              <input
                className="ip-input ip-input--name"
                value={r.label}
                onChange={e => updateResource(i, 'label', e.target.value)}
                placeholder="Name"
              />
              <select
                className="ip-select ip-select--cat"
                value={r.category}
                onChange={e => updateResource(i, 'category', e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                className="ip-input ip-input--inst"
                type="number"
                min="1"
                value={r.instances}
                onChange={e => updateResource(i, 'instances', Math.max(1, parseInt(e.target.value) || 1))}
                title="Instances"
              />
              {resources.length > 1 && (
                <button className="ip-remove-node" onClick={() => removeResource(i)} title="Remove">×</button>
              )}
            </div>
          ))}
        </div>
        {isMulti && (
          <div className="ip-multi-badge">⚡ Multi-instance detected — Banker's Algorithm will be used</div>
        )}
      </div>

      {/* ── Request Edges ── */}
      <div className="ip-section">
        <div className="ip-section-title">Request Edges <span className="ip-badge">(Process → Resource)</span></div>
        <div className="ip-edge-add">
          <select className="ip-select" value={newReq.process}
            onChange={e => setNewReq(v => ({ ...v, process: e.target.value }))}>
            {processes.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <span className="ip-arrow">→</span>
          <select className="ip-select" value={newReq.resource}
            onChange={e => setNewReq(v => ({ ...v, resource: e.target.value }))}>
            {resources.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <button className="ip-add-btn" onClick={addRequest}>+</button>
        </div>
        <div className="ip-edge-list">
          {requests.length === 0 && <div className="ip-empty">No request edges</div>}
          {requests.map((req, i) => (
            <div key={i} className="ip-edge-chip ip-edge-chip--request">
              <span>{pLabel(req.process)}</span>
              <span className="ip-arrow-chip">→</span>
              <span>{rLabel(req.resource)}</span>
              <button onClick={() => setRequests(p => p.filter((_, j) => j !== i))} className="ip-remove">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Allocation Edges ── */}
      <div className="ip-section">
        <div className="ip-section-title">Allocation Edges <span className="ip-badge">(Resource → Process)</span></div>
        <div className="ip-edge-add">
          <select className="ip-select" value={newAlloc.resource}
            onChange={e => setNewAlloc(v => ({ ...v, resource: e.target.value }))}>
            {resources.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <span className="ip-arrow">→</span>
          <select className="ip-select" value={newAlloc.process}
            onChange={e => setNewAlloc(v => ({ ...v, process: e.target.value }))}>
            {processes.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          {isMulti && (
            <input type="number" min="1" className="ip-input ip-input--inst"
              value={newAlloc.instances}
              onChange={e => setNewAlloc(v => ({ ...v, instances: Math.max(1, parseInt(e.target.value) || 1) }))}
              title="Instances to allocate"
            />
          )}
          <button className="ip-add-btn" onClick={addAllocation}>+</button>
        </div>
        <div className="ip-edge-list">
          {allocations.length === 0 && <div className="ip-empty">No allocation edges</div>}
          {allocations.map((alloc, i) => (
            <div key={i} className="ip-edge-chip ip-edge-chip--alloc">
              <span>{rLabel(alloc.resource)}</span>
              <span className="ip-arrow-chip">→</span>
              <span>{pLabel(alloc.process)}</span>
              {isMulti && <span className="ip-inst-badge">×{alloc.instances || 1}</span>}
              <button onClick={() => setAllocations(p => p.filter((_, j) => j !== i))} className="ip-remove">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Max Demand (optional, for Banker's) ── */}
      {isMulti && (
        <div className="ip-section">
          <div className="ip-section-header">
            <div className="ip-section-title">Max Demand <span className="ip-badge">(optional)</span></div>
            <button className="ip-toggle-btn" onClick={() => setShowMax(s => !s)}>
              {showMax ? '▲ Hide' : '▼ Show'}
            </button>
          </div>
          {showMax && (
            <>
              <div className="ip-edge-add">
                <select className="ip-select" value={newMax.process}
                  onChange={e => setNewMax(v => ({ ...v, process: e.target.value }))}>
                  {processes.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <span className="ip-arrow">needs max</span>
                <input type="number" min="1" className="ip-input ip-input--inst"
                  value={newMax.instances}
                  onChange={e => setNewMax(v => ({ ...v, instances: Math.max(1, parseInt(e.target.value) || 1) }))}
                />
                <span className="ip-arrow">of</span>
                <select className="ip-select" value={newMax.resource}
                  onChange={e => setNewMax(v => ({ ...v, resource: e.target.value }))}>
                  {resources.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                <button className="ip-add-btn" onClick={addMaxDemand}>+</button>
              </div>
              <div className="ip-edge-list">
                {maxDemand.length === 0 && <div className="ip-empty">No max demand entries</div>}
                {maxDemand.map((m, i) => (
                  <div key={i} className="ip-edge-chip ip-edge-chip--max">
                    <span>{pLabel(m.process)}</span>
                    <span className="ip-arrow-chip">max {m.instances}</span>
                    <span>{rLabel(m.resource)}</span>
                    <button onClick={() => setMaxDemand(p => p.filter((_, j) => j !== i))} className="ip-remove">×</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {validErr && <div className="ip-validation-err">{validErr}</div>}

      <div className="ip-actions">
        <button className="ip-btn ip-btn--primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="ip-spinner"></span> Analyzing…</> : <><span>⬡</span> Generate Graph</>}
        </button>
        <div className="ip-sample-row">
          <button className="ip-btn ip-btn--secondary" onClick={() => handleSample('single')}>⚡ Sample (Single)</button>
          <button className="ip-btn ip-btn--secondary" onClick={() => handleSample('multi')}>⚡ Sample (Multi)</button>
        </div>
        <button className="ip-btn ip-btn--ghost" onClick={handleReset}>↺ Reset</button>
      </div>
    </div>
  );
}
