import React, { useRef, useState } from 'react';
import { Button, App } from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { Merchant, BusinessCard } from '../types';
import QRCode from 'qrcode.react';

interface PrintableCardProps {
  merchant: Merchant;
  card?: BusinessCard;
  size?: 'standard' | 'compact';
}

const PrintableCard: React.FC<PrintableCardProps> = ({
  merchant,
  card,
  size = 'standard',
}) => {
  const rectoRef = useRef<HTMLDivElement>(null);
  const versoRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const { message } = App.useApp();

  const primaryColor = merchant.primaryColor || '#667eea';
  
  // Card dimensions (credit card size: 85.6mm x 53.98mm)
  const cardDimensions = {
    standard: { width: 400, height: 250 },
    compact: { width: 350, height: 220 },
  };

  const dimensions = cardDimensions[size];

  // Generate QR URL - use card's public URL or current location
  const qrUrl = card?.publicUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const generatePdfFromDiv = async (element: HTMLDivElement): Promise<string> => {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
    return canvas.toDataURL('image/png');
  };

  const generatePDF = async () => {
    if (!rectoRef.current || !versoRef.current) return;

    setGenerating(true);
    try {
      // Wait for images to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 500));

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98],
      });

      // Generate recto (front)
      const rectoImgData = await generatePdfFromDiv(rectoRef.current);
      pdf.addImage(rectoImgData, 'PNG', 0, 0, 85.6, 53.98);

      // Add new page for verso (back)
      pdf.addPage();
      
      // Generate verso (back)
      const versoImgData = await generatePdfFromDiv(versoRef.current);
      pdf.addImage(versoImgData, 'PNG', 0, 0, 85.6, 53.98);

      // Download PDF
      pdf.save(`${merchant.businessName.replace(/\s+/g, '_')}_carte.pdf`);
      message.success('PDF téléchargé avec succès!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Erreur lors de la génération du PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {/* Hidden printable cards for PDF generation */}
      <div style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0 }}>
        {/* Recto (Front) */}
        <div
          ref={rectoRef}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            background: 'white',
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif',
            border: '1px solid #ddd',
          }}
        >
          {/* Left side - Header with color */}
          <div
            style={{
              width: '35%',
              background: primaryColor,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              position: 'relative',
            }}
          >
            {/* Logo/Avatar */}
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                border: '4px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                overflow: 'hidden',
              }}
            >
              {merchant.logo ? (
                <img
                  src={merchant.logo}
                  alt="Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <span style={{ fontSize: 28, fontWeight: 'bold', color: primaryColor }}>
                  {merchant.businessName.charAt(0)}
                </span>
              )}
            </div>
            
            {merchant.category && (
              <div
                style={{
                  marginTop: 12,
                  padding: '4px 12px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 20,
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 500,
                  textAlign: 'center',
                }}
              >
                {merchant.category}
              </div>
            )}
          </div>

          {/* Right side - Info */}
          <div
            style={{
              width: '65%',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: '#333',
                lineHeight: 1.2,
              }}
            >
              {merchant.businessName}
            </h2>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 14,
                color: '#666',
              }}
            >
              {merchant.ownerName}
            </p>
            <div
              style={{
                marginTop: 16,
                padding: '12px 16px',
                background: '#f8f9fa',
                borderRadius: 8,
                borderLeft: `4px solid ${primaryColor}`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: '#333',
                  fontWeight: 600,
                }}
              >
                {merchant.phoneNumber}
              </p>
              {merchant.email && (
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 11,
                    color: '#666',
                  }}
                >
                  {merchant.email}
                </p>
              )}
              {merchant.address && (
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 11,
                    color: '#666',
                  }}
                >
                  {merchant.address}, {merchant.city}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verso (Back) */}
        <div
          ref={versoRef}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif',
            border: '1px solid #ddd',
            position: 'relative',
          }}
        >
          {/* Decorative top bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 10,
              background: primaryColor,
            }}
          />
          
          {/* QR Code */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <div
              style={{
                background: 'white',
                padding: 12,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${primaryColor}`,
              }}
            >
              <QRCode
                value={qrUrl}
                size={140}
                level="H"
                includeMargin={false}
                fgColor="#000000"
                imageSettings={
                  merchant.logo
                    ? {
                        src: merchant.logo,
                        x: undefined,
                        y: undefined,
                        height: 28,
                        width: 28,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>
            <p
              style={{
                marginTop: 16,
                fontSize: 12,
                color: '#666',
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              Scannez pour voir ma carte
            </p>
          </div>

          {/* Business name at bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: primaryColor,
                fontWeight: 700,
                padding: '4px 16px',
                background: `${primaryColor}15`,
                borderRadius: 20,
              }}
            >
              {merchant.businessName}
            </span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        justifyContent: 'center', 
        marginTop: 24,
        flexWrap: 'wrap' 
      }}>
        {/* Preview Recto */}
        <div style={{
          width: dimensions.width * 0.6,
          height: dimensions.height * 0.6,
          background: 'white',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          fontFamily: 'Arial, sans-serif',
          border: '1px solid #ddd',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div
            style={{
              width: '35%',
              background: primaryColor,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '3px solid white',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {merchant.logo ? (
                <img
                  src={merchant.logo}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  crossOrigin="anonymous"
                />
              ) : (
                <span style={{ fontSize: 16, fontWeight: 'bold', color: primaryColor }}>
                  {merchant.businessName.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              width: '65%',
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#333' }}>
              {merchant.businessName}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 8, color: '#666' }}>
              {merchant.ownerName}
            </p>
          </div>
        </div>

        {/* Preview Verso */}
        <div style={{
          width: dimensions.width * 0.6,
          height: dimensions.height * 0.6,
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          fontFamily: 'Arial, sans-serif',
          border: '1px solid #ddd',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: primaryColor }} />
          <QRCode
            value={qrUrl}
            size={80}
            level="H"
            fgColor="#000000"
          />
          <p style={{ marginTop: 8, fontSize: 8, color: '#666' }}>
            Scannez pour voir ma carte
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={generatePDF}
          loading={generating}
          size="large"
          style={{ background: primaryColor, borderColor: primaryColor }}
        >
          Télécharger en PDF
        </Button>
        <Button
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
          size="large"
        >
          Imprimer
        </Button>
      </div>
    </div>
  );
};

export default PrintableCard;
