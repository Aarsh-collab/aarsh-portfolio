"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { archive, featuredProjects, type Project } from "@/data/projects";

type Being = { name: string; color: string; image?: string; project?: Project; url?: string; description: string };
const names = ["Reachy Mini Robotic Receptionist", "Dementia Assistant", "AI-Assisted Prosthetics", "EduCAST Evaluation", "Child-Peer Simulation", "VoxProof", "InsuranceAI"];
const colors = ["#a1e6dc", "#ffd0ae", "#ead594", "#b8c9ff", "#c1e8bd", "#e8bce4", "#f1c39b", "#a8c8f1", "#a5dcae"];
const images = ["/projects/reachy/combined-cues-frame.jpg", "/projects/dementia-assistant/home-portrait.jpg", "/projects/prosthetics/rhino-slide.png", "/projects/educast/revised-190.jpg", undefined, undefined, "/projects/insurance-ai/landing.png"];
const beings: Being[] = [
  ...names.map((name, index) => { const project = featuredProjects.find((p) => p.title === name)!; return { name, color: colors[index], image: images[index], project, description: project.summary }; }),
  ...["Ender-IT Recruiting Platform", "CarbonIQ"].map((name, index) => { const item = archive.find((p) => p[0] === name)!; return { name, color: colors[index + 7], description: item[1], url: item[3] || undefined }; }),
];

type Particle = { x: number; y: number; vx: number; vy: number; phase: number; index: number };
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function ProjectUniverse({ onSelect }: { onSelect: (project: Project) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1, height = 1, frame = 0, last = 0, visible = true, t = 0;
    let pointer: { x: number; y: number } | null = null;
    let dragging: number | null = null, down: { x: number; y: number } | null = null, moved = false, creating = false;
    let hover = -1;
    const agents: Particle[] = beings.map((_, i) => ({ x: .14 + (i % 3) * .34 + (i % 2) * .025, y: .20 + Math.floor(i / 3) * .29, vx: 0, vy: 0, phase: i * 1.73, index: i }));
    const personality = (i: number) => i >= beings.length ? ([1, 0, -1][i % 3]) : ([1, 1, -1, 1, 1, -1, 0, 1, 0][i]);
    const resize = () => { const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height; const ratio = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); ctx.setTransform(ratio, 0, 0, ratio, 0, 0); draw(); };
    const point = (event: PointerEvent) => { const rect = canvas.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top }; };
    const nearest = (p: { x: number; y: number }) => { let found = -1, best = 30; agents.forEach((a, i) => { const d = Math.hypot(a.x * width - p.x, a.y * height - p.y); if (d < best) { found = i; best = d; } }); return found; };
    const setHover = (next: number) => { if (hover !== next) { hover = next; setHovered(next < 0 || next >= beings.length ? null : next); canvas.style.cursor = next < 0 ? "crosshair" : "grab"; } };
    const move = (event: PointerEvent) => { pointer = point(event); if (down) moved ||= Math.hypot(pointer.x - down.x, pointer.y - down.y) > 6; if (dragging !== null && down) { if (moved) { agents[dragging].x = clamp(pointer.x / width, .04, .96); agents[dragging].y = clamp(pointer.y / height, .06, .94); agents[dragging].vx = 0; agents[dragging].vy = 0; draw(); } } else setHover(nearest(pointer)); };
    const start = (event: PointerEvent) => { const p = point(event); const hit = nearest(p); dragging = hit < 0 ? null : hit; creating = hit < 0; down = p; moved = false; canvas.setPointerCapture(event.pointerId); };
    const end = (event: PointerEvent) => { if (event.type !== "pointercancel" && !moved) { if (creating && down && agents.length < 36) { const i = agents.length; agents.push({ x: clamp(down.x / width, .05, .95), y: clamp(down.y / height, .08, .92), vx: (Math.random() - .5) * .001, vy: (Math.random() - .5) * .001, phase: Math.random() * Math.PI * 2, index: i }); draw(); } else if (dragging !== null && dragging < beings.length) setSelected(dragging); } creating = false; dragging = null; down = null; if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); };
    const leave = () => { if (dragging === null) { pointer = null; setHover(-1); } };
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#ffffff0d"; for (let x = 18; x < width; x += 25) for (let y = 18; y < height; y += 25) { ctx.beginPath(); ctx.arc(x, y, .7, 0, Math.PI * 2); ctx.fill(); }
      agents.forEach((a) => { const nearby = agents.filter((b) => a !== b && Math.hypot((a.x - b.x) * width, (a.y - b.y) * height) < 55); if (nearby.length >= 2) { ctx.strokeStyle = "#d8eeb55a"; ctx.beginPath(); ctx.arc(a.x * width, a.y * height, 21 + 4 * Math.sin(t * 2), 0, Math.PI * 2); ctx.stroke(); } });
      agents.forEach((a, i) => { if (i !== 7 && i !== 4) return; agents.forEach((b, j) => { if (i === j) return; const d = Math.hypot((a.x - b.x) * width, (a.y - b.y) * height); if (d < 95) { ctx.strokeStyle = `rgba(165,215,201,${(1 - d / 95) * .23})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x * width, a.y * height); ctx.lineTo(b.x * width, b.y * height); ctx.stroke(); } }); });
      if (pointer && !motion.matches) { const cursor = pointer; agents.forEach((a, i) => { if (personality(i) !== 1) return; const x = a.x * width, y = a.y * height, distance = Math.hypot(x - cursor.x, y - cursor.y); if (distance < 300) { ctx.strokeStyle = `rgba(165,225,210,${Math.max(0, 1 - distance / 300) * .48})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cursor.x, cursor.y); ctx.stroke(); } }); ctx.fillStyle = "#c6efe6a0"; ctx.beginPath(); ctx.arc(cursor.x, cursor.y, 2, 0, Math.PI * 2); ctx.fill(); }
      agents.forEach((a, i) => { const x = a.x * width, y = a.y * height, r = 6 + (i % 3), color = beings[i]?.color ?? colors[i % colors.length]; const pulse = .5 + .5 * Math.sin(t * 1.5 + a.phase); ctx.save(); ctx.translate(x, y); ctx.fillStyle = color + "18"; ctx.beginPath(); ctx.arc(0, 0, r + 8 + pulse * 2, 0, Math.PI * 2); ctx.fill(); if (i === 5 || hover === i || selectedRef.current === i) { ctx.strokeStyle = color + "70"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, r + 9 + (i === 5 ? pulse * 6 : 0), 0, Math.PI * 2); ctx.stroke(); } ctx.shadowBlur = 14; ctx.shadowColor = color; ctx.fillStyle = color; ctx.beginPath(); if (i === 2) { for (let k = 0; k < 6; k++) { const angle = Math.PI * k / 3 + t * .1; const rr = r * (1 + .06 * Math.sin(t + k)); if (!k) ctx.moveTo(Math.cos(angle) * rr, Math.sin(angle) * rr); else ctx.lineTo(Math.cos(angle) * rr, Math.sin(angle) * rr); } ctx.closePath(); } else ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = "#203734"; ctx.beginPath(); ctx.arc(1, 0, 1.6, 0, Math.PI * 2); ctx.fill(); if (i === 3) { ctx.fillStyle = "#d6dfff"; ctx.beginPath(); ctx.arc(Math.cos(t + a.phase) * (r + 8), Math.sin(t + a.phase) * (r + 8), 2, 0, 7); ctx.fill(); } if (i === 8) { ctx.fillStyle = "#a5dcae70"; ctx.beginPath(); ctx.arc(-a.vx * 7, -a.vy * 7, 2.5, 0, 7); ctx.fill(); } ctx.restore(); });
    }
    const tick = (now: number) => { if (!visible || document.hidden || motion.matches) { frame = 0; return; } const dt = Math.min((now - (last || now)) / 1000, .04); last = now; t += dt; agents.forEach((a, i) => { if (dragging === i && moved) return; const slow = i === 6 ? .45 : 1; let ax = Math.cos(t * .37 * slow + a.phase) * .00011, ay = Math.sin(t * .3 * slow + a.phase * 1.4) * .00011; if (pointer) { const dx = pointer.x / width - a.x, dy = pointer.y / height - a.y, d = Math.hypot(dx * width, dy * height), disposition = personality(i); if (d < 300 && d > 16 && disposition !== 0) { const factor = (1 - d / 360) * (disposition === 1 ? .012 : -.006); ax += dx * factor; ay += dy * factor; } } if (i === 1 || i === 4) { const other = agents[i === 1 ? 4 : 1]; ax += (other.x - a.x) * .00004; ay += (other.y - a.y) * .00004; } a.vx = clamp((a.vx + ax * dt * 60) * .96, -.006, .006); a.vy = clamp((a.vy + ay * dt * 60) * .96, -.006, .006); a.x += a.vx * dt * 60; a.y += a.vy * dt * 60; if (a.x < .05 || a.x > .95) { a.vx *= -1; a.x = clamp(a.x, .05, .95); } if (a.y < .08 || a.y > .92) { a.vy *= -1; a.y = clamp(a.y, .08, .92); } }); draw(); frame = requestAnimationFrame(tick); };
    const run = () => { last = 0; if (!frame && visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick); else draw(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; } else run(); });
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas); observer.observe(shell);
    canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerdown", start); canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end); canvas.addEventListener("pointerleave", leave); document.addEventListener("visibilitychange", run); motion.addEventListener("change", run); resize(); run();
    return () => { cancelAnimationFrame(frame); resizeObserver.disconnect(); observer.disconnect(); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerdown", start); canvas.removeEventListener("pointerup", end); canvas.removeEventListener("pointercancel", end); canvas.removeEventListener("pointerleave", leave); document.removeEventListener("visibilitychange", run); motion.removeEventListener("change", run); };
  }, []);

  useEffect(() => { if (selected === null) return; closeRef.current?.focus(); const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [selected]);
  const current = selected === null ? null : beings[selected];
  return <aside className="universe" ref={shellRef} aria-label="A little universe of projects"><div className="universe-top"><span>A little universe</span><button onClick={() => setListOpen(!listOpen)} aria-expanded={listOpen}>Meet the projects {listOpen ? "−" : "+"}</button></div><div className="universe-world"><canvas ref={canvasRef} aria-hidden="true" />{hovered !== null && !current && <div className="universe-hint" aria-live="polite">{beings[hovered].name}</div>}{current && <div className="universe-backdrop" onClick={() => setSelected(null)}><div className="universe-preview" onClick={(event) => event.stopPropagation()}><button ref={closeRef} className="universe-close" aria-label="Close project preview" onClick={() => setSelected(null)}>×</button>{current.image && <div className="universe-preview-image"><Image src={current.image} alt="" fill sizes="300px" /></div>}<span className="universe-dot" style={{ background: current.color }} /><h3>{current.name}</h3><p>{current.description}</p>{current.project ? <button className="universe-open" onClick={() => { setSelected(null); onSelect(current.project!); }}>Explore project ↗</button> : current.url ? <a className="universe-open" href={current.url} target="_blank" rel="noreferrer">Explore project ↗</a> : <small>Internal project · no public link</small>}</div></div>}</div><div className="universe-copy"><h2>Things I&apos;ve brought to life.</h2><p>Every little world has a story. Find one.</p><small>Click empty space to create a creature. Move your pointer and see who follows. Click a project creature to explore.</small></div>{listOpen && <div className="universe-list" aria-label="Choose a project">{beings.map((being, i) => <button key={being.name} onClick={() => setSelected(i)}><span style={{ background: being.color }} />{being.name}</button>)}</div>}</aside>;
}
