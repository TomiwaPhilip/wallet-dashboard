"use client";

import React from 'react';
import QRCode from 'qrcode.react';
import { useSession } from '@/components/shared/session';

export interface Props {
  value: string;
}

const QrCodeGenerator: React.FC<Props> = ({value}: Props) => {
  return (
    <div className="flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-lg">
        {value ? (
          <div className="p-4 bg-gray-100 rounded-lg">
            <QRCode value={value} size={150} />
          </div>
        ) : (
          <p>No wallet address found in session.</p>
        )}
      </div>
    </div>
  );
};

export default QrCodeGenerator;
