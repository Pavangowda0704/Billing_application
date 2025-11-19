import React, { useRef, useEffect, useState } from 'react';
import Button from './Button';
import { ICONS } from '../constants';

const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        if (isOpen) {
            // Request access to the user's camera
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    setStream(stream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error("Error accessing camera: ", err);
                    onClose(); // Close modal if camera access is denied
                });
        } else {
            // Stop the camera stream when the modal is closed
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            // Convert the canvas image to a file blob
            canvas.toBlob(blob => {
                onCapture(blob);
                onClose();
            }, 'image/jpeg');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg">
                <div className="p-4 relative">
                    <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-4">Take a Photo</h3>
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-md"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="mt-4 flex justify-center">
                        <Button onClick={handleCapture} className="w-auto px-6 py-3">
                            <span className="flex items-center">
                                {ICONS.camera}
                                <span className="ml-2">Take Photo</span>
                            </span>
                        </Button>
                    </div>
                    <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        {ICONS.x}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraCaptureModal;
