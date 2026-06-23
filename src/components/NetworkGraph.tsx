import React, { useState } from "react";
import { FamilyMember } from "../types";
import { Heart, Activity, ShieldAlert, Sparkles, User, Info, CheckCircle2 } from "lucide-react";

interface NetworkGraphProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
}

export default function NetworkGraph({ members, onSelectMember }: NetworkGraphProps) {
  const [filterCondition, setFilterCondition] = useState<string>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Collect distinct conditions for filter dropdowns
  const allConditions = Array.from(
    new Set(members.flatMap((m) => m.conditions))
  ).filter(Boolean);

  // Map relationship to generation level and default spacing
  const getPosition = (member: FamilyMember, index: number, list: FamilyMember[]) => {
    // Group members by relationship to stack duplicates
    const sameRelation = list.filter((m) => m.relationship === member.relationship);
    const orderIndex = sameRelation.findIndex((m) => m.id === member.id);
    const totalCount = sameRelation.length;
    const spread = totalCount > 1 ? (orderIndex - (totalCount - 1) / 2) * 75 : 0;

    switch (member.relationship) {
      case "Paternal Grandfather":
        return { x: 180 + spread, y: 80 };
      case "Paternal Grandmother":
        return { x: 320 + spread, y: 80 };
      case "Maternal Grandfather":
        return { x: 580 + spread, y: 80 };
      case "Maternal Grandmother":
        return { x: 720 + spread, y: 80 };

      case "Uncle (Paternal)":
        return { x: 80 + spread, y: 230 };
      case "Aunt (Paternal)":
        return { x: 170 + spread, y: 230 };
      case "Father":
        return { x: 280 + spread, y: 230 };

      case "Mother":
        return { x: 520 + spread, y: 230 };
      case "Uncle (Maternal)":
        return { x: 680 + spread, y: 230 };
      case "Aunt (Maternal)":
        return { x: 780 + spread, y: 230 };

      case "Brother":
        return { x: 210 + spread, y: 390 };
      case "Sister":
        return { x: 590 + spread, y: 390 };

      case "Self":
        return { x: 400, y: 390 };

      case "Son":
        return { x: 300 + spread, y: 530 };
      case "Daughter":
        return { x: 500 + spread, y: 530 };

      default:
        // Fallback spiral layout
        const angle = index * 0.9;
        const radius = 170;
        return { x: 400 + Math.cos(angle) * radius, y: 300 + Math.sin(angle) * radius };
    }
  };

  // Determine node color category
  const getNodeColor = (member: FamilyMember) => {
    const totalConditions = member.conditions.length;
    const isDeceased = member.deceased;
    
    if (filterCondition !== "all" && member.conditions.includes(filterCondition)) {
      return {
        bg: "fill-[#C9A84C]", // Gold accent highlighting for active search match
        border: "stroke-[#C9A84C]",
        ring: "rgba(201, 168, 76, 0.4)",
      };
    }

    if (isDeceased) {
      return {
        bg: "fill-[#2A1620]", // Dusty burgundy
        border: "stroke-[#E05C5C]",
        ring: "rgba(224, 92, 92, 0.3)",
      };
    }

    if (totalConditions >= 3) {
      return {
        bg: "fill-[#3C1A1C]", // Deep threat red
        border: "stroke-[#E05C5C]",
        ring: "rgba(224, 92, 92, 0.4)",
      };
    } else if (totalConditions > 0) {
      return {
        bg: "fill-[#292A1A]", // Olive warning yellow
        border: "stroke-[#C9A84C]",
        ring: "rgba(201, 168, 76, 0.4)",
      };
    } else {
      return {
        bg: "fill-[#0E2820]", // Soothing health forest green
        border: "stroke-[#4CAF7D]",
        ring: "rgba(76, 175, 125, 0.3)",
      };
    }
  };

  // Build plotted nodes with their coordinate positions
  const plottedNodes = members.map((member, i) => {
    const pos = getPosition(member, i, members);
    const styling = getNodeColor(member);
    return {
      member,
      x: pos.x,
      y: pos.y,
      styling,
    };
  });

  const getPartnerLines = () => {
    const lines: React.ReactNode[] = [];

    // Helper to find node coordinate by relationship
    const findByRelation = (rel: string) => plottedNodes.find((n) => n.member.relationship === rel);

    // 1. Paternal Grandparents Marriage Connector & Offspring branch
    const patGF = findByRelation("Paternal Grandfather");
    const patGM = findByRelation("Paternal Grandmother");
    if (patGF && patGM) {
      const midX = (patGF.x + patGM.x) / 2;
      const midY = patGF.y;
      lines.push(
        <line key="pat-marriage" x1={patGF.x} y1={patGF.y} x2={patGM.x} y2={patGM.y} className="stroke-[#C9A84C] stroke-[2] stroke-dasharray-[4]" />
      );
      // Father link
      const father = findByRelation("Father");
      if (father) {
        lines.push(
          <path
            key="pat-branch"
            d={`M ${midX} ${midY} L ${midX} ${midY + 50} H ${father.x} V ${father.y}`}
            fill="none"
            className="stroke-slate-500 stroke-[1.5]"
          />
        );
      }
    }

    // 2. Maternal Grandparents Marriage Connector & Offspring branch
    const matGF = findByRelation("Maternal Grandfather");
    const matGM = findByRelation("Maternal Grandmother");
    if (matGF && matGM) {
      const midX = (matGF.x + matGM.x) / 2;
      const midY = matGF.y;
      lines.push(
        <line key="mat-marriage" x1={matGF.x} y1={matGF.y} x2={matGM.x} y2={matGM.y} className="stroke-[#C9A84C] stroke-[2] stroke-dasharray-[4]" />
      );
      // Mother link
      const mother = findByRelation("Mother");
      if (mother) {
        lines.push(
          <path
            key="mat-branch"
            d={`M ${midX} ${midY} L ${midX} ${midY + 50} H ${mother.x} V ${mother.y}`}
            fill="none"
            className="stroke-slate-500 stroke-[1.5]"
          />
        );
      }
    }

    // 3. Father & Mother Marriage Bar
    const fatherNode = findByRelation("Father");
    const motherNode = findByRelation("Mother");
    if (fatherNode && motherNode) {
      const midX = (fatherNode.x + motherNode.x) / 2;
      const midY = fatherNode.y;
      lines.push(
        <line key="parents-marriage" x1={fatherNode.x} y1={fatherNode.y} x2={motherNode.x} y2={motherNode.y} className="stroke-[#C9A84C] stroke-[2.5]" />
      );
      // Descent level line to Self / Sibling
      const selfNode = findByRelation("Self");
      if (selfNode) {
        lines.push(
          <path
            key="descent-branch"
            d={`M ${midX} ${midY} L ${midX} ${selfNode.y - 60} H ${selfNode.x} V ${selfNode.y}`}
            fill="none"
            className="stroke-[#C9A84C] stroke-[2]"
          />
        );
        
        // Connect brother
        const brotherNode = findByRelation("Brother");
        if (brotherNode) {
          lines.push(
            <path
              key="brother-branch"
              d={`M ${midX} ${selfNode.y - 60} H ${brotherNode.x} V ${brotherNode.y}`}
              fill="none"
              className="stroke-slate-500 stroke-[1.5]"
            />
          );
        }

        // Connect sister
        const sisterNode = findByRelation("Sister");
        if (sisterNode) {
          lines.push(
            <path
              key="sister-branch"
              d={`M ${midX} ${selfNode.y - 60} H ${sisterNode.x} V ${sisterNode.y}`}
              fill="none"
              className="stroke-slate-500 stroke-[1.5]"
            />
          );
        }
      }
    }

    return lines;
  };

  const selectedNode = plottedNodes.find((n) => n.member.id === selectedNodeId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full" id="health-tree-view">
      {/* Visual Canvas Panel */}
      <div className="flex-1 bg-[#050D18] border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col">
        {/* Filters Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 z-10 border-b border-slate-900 pb-4 mb-4">
          <div>
            <span className="text-sm font-medium text-slate-400">Filter DNA Map:</span>
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="ml-3 bg-[#0A1628] text-[#F5F0E8] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-sans focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="all">View All Conditions</option>
              {allConditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Color Legend Badge row */}
          <div className="flex items-center gap-4 text-xs font-sans">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E05C5C] inline-block shadow-[0_0_8px_rgba(224,92,92,0.4)]"></span>
              <span className="text-slate-400">High Risk / Deceased</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#C9A84C] inline-block shadow-[0_0_8px_rgba(201,168,76,0.4)]"></span>
              <span className="text-slate-400">Moderate Recurrence</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#4CAF7D] inline-block shadow-[0_0_8px_rgba(76,175,125,0.4)]"></span>
              <span className="text-slate-400">No Known Conditions</span>
            </div>
          </div>
        </div>

        {/* SVG Pedigree Interactive Genogram */}
        <div className="flex-1 w-full min-h-[460px] md:min-h-[550px] relative overflow-auto flex items-center justify-center">
          <svg
            viewBox="0 0 900 620"
            className="w-full max-w-4xl h-auto select-none overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background pattern */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#0e1726" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />

            {/* Marriage / Birth Descents */}
            {getPartnerLines()}

            {/* Render Members Nodes */}
            {plottedNodes.map((node) => {
              const isSelected = selectedNodeId === node.member.id;
              const matchesFilter = filterCondition !== "all" && node.member.conditions.includes(filterCondition);
              
              return (
                <g
                  key={node.member.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedNodeId(node.member.id);
                    onSelectMember(node.member);
                  }}
                >
                  {/* Outer Pulsing Aura */}
                  <circle
                    r={isSelected ? "34" : matchesFilter ? "30" : "25"}
                    fill="none"
                    stroke={matchesFilter ? "#C9A84C" : node.styling.border.replace("stroke-", "")}
                    strokeWidth="1"
                    opacity="0.5"
                    className={node.member.deceased ? "" : "animate-pulse"}
                    style={{
                      stroke: matchesFilter ? "#C9A84C" : undefined,
                    }}
                  />

                  {/* Node Capsule Circle */}
                  <circle
                    r={isSelected ? "28" : "22"}
                    className={`${node.styling.bg} ${node.styling.border} stroke-[2.5] transition-all duration-300 group-hover:scale-110`}
                  />

                  {/* Relation initials or mini icon */}
                  <g transform="translate(0, 0)">
                    {node.member.relationship === "Self" ? (
                      <Heart size={14} className="text-white translate-x-[-7px] translate-y-[-7px]" fill="white" />
                    ) : node.member.deceased ? (
                      <text
                        textAnchor="middle"
                        dy="4"
                        className="font-mono text-[9px] font-bold fill-rose-300 pointer-events-none"
                      >
                        †
                      </text>
                    ) : (
                      <text
                        textAnchor="middle"
                        dy="4"
                        className="font-mono text-[10px] font-bold fill-[#F5F0E8] pointer-events-none uppercase"
                      >
                        {node.member.relationship.slice(0, 2)}
                      </text>
                    )}
                  </g>

                  {/* Hover visual highlight frame */}
                  <circle
                    r={isSelected ? "38" : "32"}
                    fill="none"
                    className="stroke-[#C9A84C] stroke-[2] opacity-0 group-hover:opacity-100 transition-opacity"
                  />

                  {/* Floating relation & health pills text tags */}
                  <g transform="translate(0, 36)">
                    {/* Dark backing block to prevent overlapping text readability issues */}
                    <rect
                      x="-70"
                      y="-12"
                      width="140"
                      height="24"
                      rx="6"
                      fill="#0A1628"
                      stroke="#1e293b"
                      strokeWidth="0.8"
                    />
                    <text
                      textAnchor="middle"
                      className="font-sans text-[11px] font-semibold fill-[#F5F0E8]"
                    >
                      {node.member.name}
                    </text>
                    <text
                      textAnchor="middle"
                      dy="10"
                      className="font-sans text-[8px] font-medium fill-slate-400 uppercase tracking-wider"
                    >
                      {node.member.relationship}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Dynamic Drill Down Details Panel */}
      <div className="w-full lg:w-[320px] bg-[#0A1628] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
        {selectedNode ? (
          <div className="flex flex-col h-full justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-[#C9A84C] border border-[#C9A84C]/40">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#F5F0E8] font-bold leading-tight">
                    {selectedNode.member.name}
                  </h3>
                  <p className="text-xs text-[#C9A84C] font-semibold uppercase tracking-wider font-sans">
                    {selectedNode.member.relationship}
                  </p>
                </div>
              </div>

              {/* Status and age metadata grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-sans">
                <div className="bg-[#050D18] p-2 rounded-lg border border-slate-900">
                  <span className="text-slate-400 block pb-0.5">Status</span>
                  <span
                    className={`font-semibold ${
                      selectedNode.member.deceased ? "text-[#E05C5C]" : "text-[#4CAF7D]"
                    }`}
                  >
                    {selectedNode.member.deceased ? "Deceased" : "Living"}
                  </span>
                </div>
                <div className="bg-[#050D18] p-2 rounded-lg border border-slate-900">
                  <span className="text-slate-400 block pb-0.5">Age Record</span>
                  <span className="font-semibold text-[#F5F0E8]">
                    {selectedNode.member.deceased
                      ? `${selectedNode.member.ageAtDeath} yr (Death)`
                      : `${selectedNode.member.age || "N/A"} yr old`}
                  </span>
                </div>
              </div>

              {/* Conditions list */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[#C9A84C] uppercase tracking-wider font-sans border-l-2 border-[#C9A84C] pl-2 mb-2">
                  Conditions
                </h4>
                {selectedNode.member.conditions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.member.conditions.map((cond, k) => (
                      <span
                        key={k}
                        className="bg-red-950/40 text-rose-300 text-[10px] font-sans font-medium px-2 py-1 rounded border border-rose-900/50"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic text-slate-500 font-sans">No known conditions</span>
                )}
              </div>

              {/* Collateral Symptoms */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans border-l-2 border-slate-800 pl-2 mb-2">
                  Key Symptoms
                </h4>
                {selectedNode.member.symptoms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.member.symptoms.map((symptom, k) => (
                      <span
                        key={k}
                        className="bg-slate-900 text-slate-300 text-[10px] font-sans px-2 py-0.5 rounded border border-slate-850"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic text-slate-500 font-sans">None recorded</span>
                )}
              </div>

              {/* Medications list */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans border-l-2 border-slate-800 pl-2 mb-2">
                  Active Medications
                </h4>
                {selectedNode.member.medications.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.member.medications.map((med, k) => (
                      <span
                        key={k}
                        className="bg-slate-900 text-[#4CAF7D] text-[10px] font-sans font-medium px-2 py-0.5 rounded border border-emerald-950/40"
                      >
                        {med}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic text-slate-500 font-sans">None listed</span>
                )}
              </div>

              {/* Habits and Lifestyle */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans border-l-2 border-slate-800 pl-2 mb-2">
                  Habits & Lifestyle
                </h4>
                {selectedNode.member.lifestyle.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.member.lifestyle.map((life, k) => (
                      <span
                        key={k}
                        className="bg-orange-950/20 text-orange-200 text-[10px] font-sans px-2 py-0.5 rounded border border-orange-900/30"
                      >
                        {life}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic text-slate-500 font-sans">No lifestyle records</span>
                )}
              </div>
            </div>

            <div className="bg-[#050D18] p-3 rounded-xl border border-dashed border-slate-800 flex items-start gap-2.5">
              <Info size={14} className="text-[#C9A84C] shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                Lineage data is analyzed by the Pattern and Risk Agents to construct your personal hereditary genetic profile map.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center h-full gap-3">
            <Activity className="text-slate-600 animate-pulse" size={36} />
            <h4 className="font-serif text-[#F5F0E8] font-semibold text-sm">Select Node</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-[200px]">
              Click any family member node directly on the pedigree map to inspect detailed conditions, symptoms, and lifestyle logs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
