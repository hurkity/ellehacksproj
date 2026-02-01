"use client";
import React, { useRef, useEffect } from 'react';

const GameCamera: React.FC = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		// Camera setup
		const getCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ video: true });
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			} catch (err) {
				console.error('Error accessing camera:', err);
			}
		};
		getCamera();
		console.log('GameCamera mounted');

		// WebSocket setup
		try {
			console.log('Attempting to create WebSocket...');
			wsRef.current = new WebSocket('ws://127.0.0.1:8000/ws/pose');
			wsRef.current.onopen = () => {
				console.log('WebSocket connection opened');
				wsRef.current?.send('frontend connected');
			};
			wsRef.current.onmessage = (event) => {
				const data = JSON.parse(event.data);
				console.log('Received pose data:', data);
				if (data.landmarks && data.landmarks.length > 0) {
					drawSkeleton(data.landmarks);
				}
			};
			wsRef.current.onerror = (err) => {
				console.error('WebSocket error:', err);
				alert('WebSocket connection error. Check if backend is running.');
			};
			wsRef.current.onclose = () => {
				console.warn('WebSocket connection closed');
			};
		} catch (e) {
			console.error('Failed to create WebSocket:', e);
		}
		return () => {
			wsRef.current?.close();
		};
	}, []);

	// Draw skeleton landmarks on canvas
	const drawSkeleton = (landmarks: Array<{ x: number; y: number }>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'red';
		landmarks.forEach((lm) => {
			ctx.beginPath();
			ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
			ctx.fill();
		});
	};

	return (
		<div style={{ position: 'relative', width: '640px', height: '480px' }}>
			<video
				ref={videoRef}
				width={640}
				height={480}
				autoPlay
				style={{ position: 'absolute', top: 0, left: 0 }}
			/>
			<canvas
				ref={canvasRef}
				width={640}
				height={480}
				style={{ position: 'absolute', top: 0, left: 0 }}
			/>
		</div>
	);
};

export default GameCamera;
