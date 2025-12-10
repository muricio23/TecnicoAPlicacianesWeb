import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { screenToWorld, worldToScreen } from '../utils/geometry';
import { GeometricObject, Point } from '../types';

export const GraphicsView: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { objects, scale, offset, setOffset, setScale, tool, addObject } = useStore();
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [tempPoint, setTempPoint] = useState<Point | null>(null);

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;

        const startX = Math.floor((-offset.x) / scale);
        const endX = Math.ceil((width - offset.x) / scale);

        for (let i = startX; i <= endX; i++) {
            const x = i * scale + offset.x;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        const startY = Math.floor((offset.y - height) / scale);
        const endY = Math.ceil(offset.y / scale);

        for (let i = startY; i <= endY; i++) {
            const y = -i * scale + offset.y;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;

        const yAxisPos = offset.y;
        if (yAxisPos >= 0 && yAxisPos <= height) {
            ctx.beginPath();
            ctx.moveTo(0, yAxisPos);
            ctx.lineTo(width, yAxisPos);
            ctx.stroke();
        }

        const xAxisPos = offset.x;
        if (xAxisPos >= 0 && xAxisPos <= width) {
            ctx.beginPath();
            ctx.moveTo(xAxisPos, 0);
            ctx.lineTo(xAxisPos, height);
            ctx.stroke();
        }
    };

    const drawObjects = (ctx: CanvasRenderingContext2D) => {
        objects.forEach((obj) => {
            if (obj.type === 'point') {
                const { x, y } = worldToScreen(obj.x, obj.y, scale, offset.x, offset.y);
                ctx.fillStyle = obj.color;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.font = '12px sans-serif';
                ctx.fillText(obj.label, x + 8, y - 8);
            } else if (obj.type === 'line') {
                const p1 = objects.find((o) => o.id === obj.p1Id) as GeometricObject & { x: number; y: number };
                const p2 = objects.find((o) => o.id === obj.p2Id) as GeometricObject & { x: number; y: number };
                if (p1 && p2) {
                    const s1 = worldToScreen(p1.x, p1.y, scale, offset.x, offset.y);
                    const s2 = worldToScreen(p2.x, p2.y, scale, offset.x, offset.y);

                    ctx.strokeStyle = obj.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();

                    const dx = s2.x - s1.x;
                    const dy = s2.y - s1.y;

                    ctx.moveTo(s1.x - dx * 100, s1.y - dy * 100);
                    ctx.lineTo(s2.x + dx * 100, s2.y + dy * 100);

                    ctx.stroke();
                }
            } else if (obj.type === 'circle') {
                const center = objects.find((o) => o.id === obj.centerId) as GeometricObject & { x: number; y: number };
                const point = objects.find((o) => o.id === obj.pointId) as GeometricObject & { x: number; y: number };
                if (center && point) {
                    const sCenter = worldToScreen(center.x, center.y, scale, offset.x, offset.y);
                    const radius = Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)) * scale;

                    ctx.strokeStyle = obj.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(sCenter.x, sCenter.y, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        });

        if (tempPoint) {
            const { x, y } = worldToScreen(tempPoint.x, tempPoint.y, scale, offset.x, offset.y);
            ctx.fillStyle = '#999';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);
        drawGrid(ctx, width, height);
        drawObjects(ctx);
    };

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = containerRef.current.clientHeight;
                render();
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        render();
    }, [objects, scale, offset, tempPoint]);

    const getMouseWorldPos = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return screenToWorld(
            e.clientX - rect.left,
            e.clientY - rect.top,
            scale,
            offset.x,
            offset.y
        );
    };

    const createPoint = (x: number, y: number) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newPoint: GeometricObject = {
            type: 'point',
            id,
            x,
            y,
            label: String.fromCharCode(65 + objects.filter(o => o.type === 'point').length),
            color: '#1e88e5',
        };
        addObject(newPoint);
        return id;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === 'select') {
            setIsDragging(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
        } else {
            const pos = getMouseWorldPos(e);
            if (!pos) return;

            if (tool === 'point') {
                createPoint(pos.x, pos.y);
            } else if (tool === 'line' || tool === 'circle') {
                if (!tempPoint) {
                    createPoint(pos.x, pos.y);
                    setTempPoint({ x: pos.x, y: pos.y });
                } else {
                    const p2Id = createPoint(pos.x, pos.y);
                    const p1 = objects[objects.length - 2]; // The one before the last one (which is p2)

                    if (p1) {
                        if (tool === 'line') {
                            addObject({
                                type: 'line',
                                id: Math.random().toString(36).substr(2, 9),
                                p1Id: p1.id,
                                p2Id: p2Id,
                                label: 'f',
                                color: '#000000',
                            });
                        } else if (tool === 'circle') {
                            addObject({
                                type: 'circle',
                                id: Math.random().toString(36).substr(2, 9),
                                centerId: p1.id,
                                pointId: p2Id,
                                label: 'c',
                                color: '#000000',
                            });
                        }
                    }
                    setTempPoint(null);
                }
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && tool === 'select') {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setOffset({ x: offset.x + dx, y: offset.y + dy });
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        const zoomSensitivity = 0.001;
        const newScale = scale * (1 - e.deltaY * zoomSensitivity);
        setScale(Math.max(10, Math.min(500, newScale)));
    };

    return (
        <div ref={containerRef} className="flex-1 relative overflow-hidden bg-white cursor-crosshair">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 block"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            />
        </div>
    );
};
