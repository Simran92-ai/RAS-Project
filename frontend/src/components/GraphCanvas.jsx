import React, { useEffect, useRef, useCallback } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import './GraphCanvas.css';

function getPalette(isDark) {
  return {
    processColor: isDark ? '#6475ff' : '#4361ee',
    resourceColor: isDark ? '#f49058' : '#c85d1e',
    deadlockColor: '#e53e3e',
    edgeDefault: isDark ? '#555580' : '#7777aa',
    edgeFontColor: isDark ? '#9090c0' : '#444466',
    nodeFontColor: isDark ? '#e8e8f5' : '#111122',
    processBg: isDark ? 'rgba(100,117,255,0.18)' : '#eef0ff',
    resourceBg: isDark ? 'rgba(244,144,88,0.18)' : '#fff3eb',
    deadlockBg: isDark ? 'rgba(229,62,62,0.20)' : '#fff0f0',
    processBorder: isDark ? '#6475ff' : '#4361ee',
    resourceBorder: isDark ? '#f49058' : '#c85d1e',
    deadlockBorder: '#e53e3e',
    fontStrokeWidth: isDark ? 0 : 3,
    fontStrokeColor: '#ffffff',
  };
}

function buildOptions(isDark) {
  const p = getPalette(isDark);
  return {
    nodes: {
      font: {
        family: 'DM Sans, sans-serif', size: 14, color: p.nodeFontColor,
        strokeWidth: p.fontStrokeWidth, strokeColor: p.fontStrokeColor,
      },
      borderWidth: 2, borderWidthSelected: 3,
      shadow: { enabled: true, size: isDark ? 8 : 4, x: 0, y: 2, color: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)' },
    },
    edges: {
      width: 2,
      color: { color: p.edgeDefault, highlight: p.processColor, hover: p.processColor },
      arrows: { to: { enabled: true, scaleFactor: 0.8 } },
      smooth: { type: 'curvedCW', roundness: 0.15 }, selectionWidth: 3,
    },
    physics: {
      enabled: true, solver: 'forceAtlas2Based',
      forceAtlas2Based: { gravitationalConstant: -60, centralGravity: 0.008, springLength: 130, springConstant: 0.05, damping: 0.6, avoidOverlap: 0.6 },
      stabilization: { iterations: 200, updateInterval: 25 },
    },
    interaction: { hover: true, tooltipDelay: 200, zoomView: true, dragView: true, navigationButtons: true, keyboard: { enabled: true } },
    layout: { improvedLayout: true }, autoResize: true,
  };
}

function buildDatasets(graphData, isDark) {
  const p = getPalette(isDark);

  // Deadlocked node IDs — works for both single & multi instance
  const cycleNodeIds = new Set();
  (graphData.cycle_edges || []).forEach(e => {
    cycleNodeIds.add(e.source);
    cycleNodeIds.add(e.target);
  });
  const cycleEdgeSet = new Set(
    (graphData.cycle_edges || []).map(e => `${e.source}||${e.target}`)
  );

  const nodes = new DataSet(
    graphData.nodes.map(n => {
      const isProcess = n.type === 'process';
      const inCycle = cycleNodeIds.has(n.id);
      const bg = inCycle ? p.deadlockBg : (isProcess ? p.processBg : p.resourceBg);
      const border = inCycle ? p.deadlockBorder : (isProcess ? p.processBorder : p.resourceBorder);
      //const fontColor = inCycle ? p.deadlockColor : p.nodeFontColor;
      const fontColor = inCycle ? '#ff0000' : (isDark ? '#7d7d7d' : '#322d2d');

  
      return {
        id: n.id,
        label: n.label,
        shape: isProcess ? 'ellipse' : 'box',
        color: {
          background: bg,
          border,
          highlight: { background: bg, border },
          hover: { background: bg, border }
        },
        font: {
          color: fontColor,
          size: 14,
          face: 'DM Sans, sans-serif',
          strokeWidth: p.fontStrokeWidth,
          strokeColor: p.fontStrokeColor
        },
        borderWidth: inCycle ? 3 : 2,
        size: 32,
        margin: 12,
      };
    })
  );

  const edges = new DataSet(
    graphData.edges.map((e, i) => {
      const inCycle = cycleEdgeSet.has(`${e.source}||${e.target}`);
      const isReq = e.type === 'request';
      // Fixed: allocation edges are orange, request edges are blue
      const edgeColor = inCycle
        ? p.deadlockColor
        : isReq ? p.processColor : p.resourceColor;

      return {
        id: `e${i}`, from: e.source, to: e.target,
        label: isReq ? 'req' : 'alloc',
        color: { color: edgeColor, highlight: edgeColor, hover: edgeColor },
        width: inCycle ? 3 : 2,
        dashes: false,
        // font: { size: 9, color: inCycle ? p.deadlockColor : p.edgeFontColor, align: 'middle', strokeWidth: p.fontStrokeWidth, strokeColor: p.fontStrokeColor },
        font: {
          size: 9,
          color: inCycle ? '#ff0000' : (isDark ? '#7d7d7d' : '#374151'),
          align: 'middle'
        },
        arrows: { to: { enabled: true, scaleFactor: 0.8 } },
        smooth: { type: isReq ? 'curvedCW' : 'curvedCCW', roundness: 0.2 },
      };
    })
  );

  return { nodes, edges };
}

export default function GraphCanvas({ graphData, loading }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const prevThemeRef = useRef(null);

  const getIsDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  useEffect(() => {
    if (!graphData || !containerRef.current) return;
    const isDark = getIsDark();
    prevThemeRef.current = isDark;
    const { nodes, edges } = buildDatasets(graphData, isDark);
    if (networkRef.current) networkRef.current.destroy();
    networkRef.current = new Network(containerRef.current, { nodes, edges }, buildOptions(isDark));
    networkRef.current.once('stabilizationIterationsDone', () => {
      networkRef.current?.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
    });
    return () => { networkRef.current?.destroy(); networkRef.current = null; };
  }, [graphData]);

  useEffect(() => {
    if (!networkRef.current || !graphData) return;
    const isDark = getIsDark();
    if (prevThemeRef.current === isDark) return;
    prevThemeRef.current = isDark;
    const { nodes, edges } = buildDatasets(graphData, isDark);
    networkRef.current.setData({ nodes, edges });
    networkRef.current.setOptions(buildOptions(isDark));
    networkRef.current.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
  });

  const handleFit = useCallback(() => {
    networkRef.current?.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
  }, []);

  const handleExport = useCallback(() => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'resource-allocation-graph.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const isEmpty = !graphData && !loading;

  return (
    <div className="graph-card">
      <div className="graph-card-header">
        <div className="graph-title-group">
          <span className="card-title">Graph Visualization</span>
          {graphData && (
            <span className={`graph-status-badge ${graphData.deadlock_detected ? 'badge--deadlock' : 'badge--safe'}`}>
              {graphData.deadlock_detected ? '🔴 Deadlock Detected' : '🟢 System Safe'}
            </span>
          )}
        </div>
        <div className="graph-controls">
          {graphData && (
            <>
              <button className="gc-btn" onClick={handleFit}>⊡ Fit</button>
              <button className="gc-btn gc-btn--export" onClick={handleExport}>↓ Export PNG</button>
            </>
          )}
        </div>
      </div>
      <div className="graph-legend">
        <div className="legend-item"><span className="legend-shape legend-circle"></span><span>Process</span></div>
        <div className="legend-item"><span className="legend-shape legend-square"></span><span>Resource</span></div>
        <div className="legend-item"><span className="legend-shape legend-deadlock"></span><span>Deadlocked</span></div>
        <div className="legend-item"><span className="legend-line" style={{ background: 'var(--node-process)' }}></span><span>Request</span></div>
        <div className="legend-item"><span className="legend-line" style={{ background: 'var(--node-resource)' }}></span><span>Allocation</span></div>
      </div>
      <div className="graph-canvas-wrap">
        {loading && (
          <div className="graph-overlay"><div className="graph-spinner"></div><span>Analyzing graph…</span></div>
        )}
        {isEmpty && (
          <div className="graph-empty">
            <div className="graph-empty-icon">⬡</div>
            <p>Enter processes and resources,<br />then click <b>Generate Graph</b></p>
          </div>
        )}
        <div ref={containerRef} className="vis-container" style={{ opacity: loading || isEmpty ? 0 : 1 }} />
      </div>
    </div>
  );
}
