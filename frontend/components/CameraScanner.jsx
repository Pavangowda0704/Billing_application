import React from 'react';

const CameraScanner = () => {
    return (
        <div className="w-full max-w-md mx-auto aspect-square bg-gray-900 rounded-lg overflow-hidden relative shadow-lg border-4 border-gray-700">
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-0">
                 {/* This could be a <video> element in a real implementation */}
            </div>
            <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-dashed border-gray-400 rounded-md z-10" />

            {/* Scanning line animation */}
            <div className="absolute left-0 w-full h-1 bg-red-500/70 shadow-[0_0_10px_theme(colors.red.500)] animate-scan-line z-20" />

            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-20">
                <p className="text-white text-lg bg-black/50 px-4 py-2 rounded-md">
                    Position barcode within the frame
                </p>
            </div>
        </div>
    );
};

export default CameraScanner;