// Progress checkpoint: edited 2026-02-10 — incremental work
import { useEffect, useRef, memo } from 'react';
import * as d3 from 'd3';
import { Transaction, FraudRing } from '../types';

interface FraudGraphProps {
  transactions: Transaction[];
  fraudRings: FraudRing[];
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  type: 'card' | 'merchant' | 'device';
  label: string;
  bank: string;
  amount: number;
  riskScore: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  fingerprint: string;
  isFraud: boolean;
}

export const FraudGraph = memo(function FraudGraph({ transactions, fraudRings }: FraudGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);

  useEffect(() => {
    if (!svgRef.current || transactions.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const nodes: Node[] = [];
    const links: Link[] = [];
    const nodeMap = new Map<string, Node>();
    const fraudFingerprints = new Set(fraudRings.map(r => r.fingerprint));

    // Focus on fraud rings first, then recent suspicious transactions
    const fraudRingTransactions = transactions.filter(tx => fraudFingerprints.has(tx.jlynFingerprint));
    const suspiciousTransactions = transactions
      .filter(tx => !fraudFingerprints.has(tx.jlynFingerprint) && tx.riskScore > 30)
      .slice(-8);
    
    const focusedTransactions = [...fraudRingTransactions.slice(-12), ...suspiciousTransactions];

    focusedTransactions.forEach(tx => {
      const cardId = `card-${tx.card.slice(-4)}`;
      const merchantId = `merchant-${tx.merchant.replace(/\s+/g, '-').slice(0, 15)}`;
      const deviceId = `device-${tx.device.split('Device ')[1]?.slice(0, 2) || 'XX'}`;

      if (!nodeMap.has(cardId)) {
        const node: Node = {
          id: cardId,
          type: 'card',
          label: `Card ${tx.card.slice(-4)}`,
          bank: tx.bank,
          amount: tx.amount,
          riskScore: tx.riskScore
        };
        nodes.push(node);
        nodeMap.set(cardId, node);
      }

      if (!nodeMap.has(merchantId)) {
        const node: Node = {
          id: merchantId,
          type: 'merchant',
          label: tx.merchant,
          bank: tx.bank,
          amount: tx.amount,
          riskScore: tx.riskScore
        };
        nodes.push(node);
        nodeMap.set(merchantId, node);
      }

      if (!nodeMap.has(deviceId)) {
        const node: Node = {
          id: deviceId,
          type: 'device',
          label: tx.device,
          bank: tx.bank,
          amount: tx.amount,
          riskScore: tx.riskScore
        };
        nodes.push(node);
        nodeMap.set(deviceId, node);
      }

      const isFraud = fraudFingerprints.has(tx.jlynFingerprint);

      links.push({
        source: cardId,
        target: merchantId,
        fingerprint: tx.jlynFingerprint,
        isFraud
      });

      links.push({
        source: cardId,
        target: deviceId,
        fingerprint: tx.jlynFingerprint,
        isFraud
      });
    });

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(120)
        .strength(0.4)
      )
      .force('charge', d3.forceManyBody().strength(-500).distanceMax(300))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.5))
      .force('collision', d3.forceCollide().radius(45).strength(1))
      .force('x', d3.forceX(width / 2).strength(0.15))
      .force('y', d3.forceY(height / 2).strength(0.15))
      .alphaDecay(0.005)
      .alphaTarget(0)
      .alphaMin(0.001);

    const link = svg.append('g')
      .attr('stroke-linecap', 'round')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => d.isFraud ? '#ec4899' : '#4f46e5')
      .attr('stroke-opacity', d => d.isFraud ? 0.7 : 0.15)
      .attr('stroke-width', d => d.isFraud ? 3 : 1.5)
      .style('filter', d => d.isFraud ? 'drop-shadow(0 0 8px #ec4899)' : 'none');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', d => {
        if (d.type === 'card') return 8;
        if (d.type === 'merchant') return 9;
        return 6;
      })
      .attr('fill', d => {
        if (d.riskScore >= 71) return '#ef4444';
        if (d.riskScore >= 31) return '#eab308';
        return '#22c55e';
      })
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2.5)
      .style('filter', d => {
        if (d.riskScore >= 71) return 'drop-shadow(0 0 14px #ef4444) drop-shadow(0 0 7px rgba(239, 68, 68, 0.6))';
        if (d.riskScore >= 31) return 'drop-shadow(0 0 8px #eab308)';
        return 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.4))';
      });

    node.append('text')
      .text(d => {
        if (d.type === 'card') return '💳';
        if (d.type === 'merchant') return '🏪';
        return '📱';
      })
      .attr('x', 0)
      .attr('y', 3)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('pointer-events', 'none')
      .attr('dominant-baseline', 'central');

    node.append('title')
      .text(d => `${d.label}\nBank: ${d.bank}\nRisk: ${d.riskScore}`);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x || 0)
        .attr('y1', d => (d.source as Node).y || 0)
        .attr('x2', d => (d.target as Node).x || 0)
        .attr('y2', d => (d.target as Node).y || 0);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    simulationRef.current = simulation;

    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [transactions, fraudRings]);

  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-950/80 to-slate-900/60 backdrop-blur-xl border border-indigo-500/15 p-5 flex flex-col">
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">Fraud Network Visualization</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/40 flex-shrink-0"></div>
            <span className="text-gray-300 font-medium">Safe</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/40 flex-shrink-0"></div>
            <span className="text-gray-300 font-medium">Suspicious</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/40 flex-shrink-0"></div>
            <span className="text-gray-300 font-medium">Fraud</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-0.5 w-4 bg-pink-500 rounded-full shadow-lg shadow-pink-500/40 flex-shrink-0"></div>
            <span className="text-gray-300 font-medium">Fraud Link</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-0.5 w-4 bg-indigo-400/50 rounded-full flex-shrink-0"></div>
            <span className="text-gray-400 font-medium">Normal</span>
          </div>
        </div>
      </div>
      <svg ref={svgRef} className="w-full flex-1 rounded-lg"></svg>
    </div>
  );
});
