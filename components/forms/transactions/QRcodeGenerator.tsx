"use client";

import React from 'react';
import QRCode from 'qrcode.react';
import { useSession } from '@/components/shared/session';


const QrCodeGenerator: React.FC = () => {
  const session = useSession();
  const walletAddress = session?.walletAddress || '';

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-lg">
        {walletAddress ? (
          <div className="p-4 bg-gray-100 rounded-lg">
            <QRCode value={walletAddress} size={150} />
          </div>
        ) : (
          <p>No wallet address found in session.</p>
        )}
      </div>
    </div>
  );
};

export default QrCodeGenerator;
