import React, { useRef, useEffect, useState } from 'react';
import { Avatar, Typography, Tag, Button, Space, Spin } from 'antd';
import {
  PhoneOutlined,
  WhatsAppOutlined,
  MailOutlined,
  EnvironmentOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { Merchant, BusinessCard } from '../types';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { Title, Text } = Typography;

interface MemberCardVisualizerProps {
  merchant: Merchant;
  card?: BusinessCard;
  showQRCode?: boolean;
  size?: 'small' | 'medium' | 'large';
  onCall?: () => void;
  onWhatsApp?: () => void;
  onEmail?: () => void;
  onMaps?: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  useGradient?: boolean;
  showDownloadButton?: boolean;
}

const MemberCardVisualizer: React.FC<MemberCardVisualizerProps> = ({
  merchant,
  card,
  showQRCode = true,
  size = 'medium',
  onCall,
  onWhatsApp,
  onEmail,
  onMaps,
  primaryColor: propPrimaryColor,
  secondaryColor: propSecondaryColor,
  useGradient: propUseGradient,
  showDownloadButton = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Use prop colors if provided, otherwise fall back to merchant colors
  const primaryColor = propPrimaryColor || merchant.primaryColor || '#667eea';
  const secondaryColor = propSecondaryColor || merchant.secondaryColor || '#764ba2';
  const useGradient = propUseGradient !== undefined ? propUseGradient : (merchant.useGradient !== undefined ? merchant.useGradient : true);
  
  const sizeStyles = {
    small: {
      card: { width: 280, padding: 12 },
      avatar: { width: 50, height: 50 },
      title: { fontSize: 16 },
      text: { fontSize: 12 },
      qrSize: 80,
    },
    medium: {
      card: { width: 320, padding: 16 },
      avatar: { width: 70, height: 70 },
      title: { fontSize: 20 },
      text: { fontSize: 14 },
      qrSize: 100,
    },
    large: {
      card: { width: 380, padding: 24 },
      avatar: { width: 90, height: 90 },
      title: { fontSize: 24 },
      text: { fontSize: 16 },
      qrSize: 140,
    },
  };

  const styles = sizeStyles[size];

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [canvas.width * 0.264, canvas.height * 0.264],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.264, canvas.height * 0.264);
      pdf.save(`${merchant.businessName.replace(/\s+/g, '_')}_carte.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Listen for download PDF event
  useEffect(() => {
    const handleDownload = () => {
      handleDownloadPDF();
    };
    
    window.addEventListener('download-pdf', handleDownload);
    return () => window.removeEventListener('download-pdf', handleDownload);
  }, [merchant.businessName]);

  const handleCall = () => {
    if (merchant.phoneNumber) {
      window.location.href = `tel:${merchant.phoneNumber}`;
    }
    onCall?.();
  };

  const handleWhatsApp = () => {
    const phone = merchant.whatsappNumber || merchant.phoneNumber;
    if (phone) {
      const formattedPhone = phone.startsWith('+') ? phone.replace(/\+/g, '') : `221${phone}`;
      window.open(`https://wa.me/${formattedPhone}`, '_blank');
    }
    onWhatsApp?.();
  };

  const handleEmail = () => {
    if (merchant.email) {
      window.location.href = `mailto:${merchant.email}`;
    }
    onEmail?.();
  };

  const handleMaps = () => {
    if (merchant.latitude && merchant.longitude) {
      window.open(
        `https://www.google.com/maps?q=${merchant.latitude},${merchant.longitude}`,
        '_blank'
      );
    } else if (merchant.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          merchant.address + ', ' + merchant.city
        )}`,
        '_blank'
      );
    }
    onMaps?.();
  };

  return (
    <div style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        style={{
          width: styles.card.width,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          position: 'relative',
          transform: 'rotateY(0deg)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Header with gradient or solid color */}
        <div
          style={{
            height: 60,
            background: useGradient 
              ? `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
              : primaryColor,
            position: 'relative',
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              left: 20,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: styles.card.padding, paddingTop: 0 }}>
          {/* Avatar overlapping header */}
          <div
            style={{
              marginTop: -styles.avatar.height / 2 - 10,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            <Avatar
              src={merchant.logo}
              size={styles.avatar.width}
              style={{
                border: `4px solid white`,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              {merchant.businessName.charAt(0)}
            </Avatar>
          </div>

          {/* Business Info */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Title
              level={4}
              style={{
                margin: 0,
                fontSize: styles.title.fontSize,
                fontWeight: 700,
                color: '#333',
              }}
            >
              {merchant.businessName}
            </Title>
            <Text
              style={{
                fontSize: styles.text.fontSize,
                color: '#666',
                display: 'block',
                marginTop: 4,
              }}
            >
              {merchant.ownerName}
            </Text>
            {merchant.category && (
              <Tag
                color={primaryColor}
                style={{
                  marginTop: 8,
                  borderRadius: 20,
                  fontSize: 11,
                }}
              >
                {merchant.category}
              </Tag>
            )}
          </div>

          {/* Contact Buttons */}
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              <Button
                type="default"
                icon={<PhoneOutlined />}
                block
                onClick={handleCall}
                style={{
                  borderRadius: 8,
                  height: 36,
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                {merchant.phoneNumber}
              </Button>

              {merchant.whatsappNumber && (
                <Button
                  type="default"
                  icon={<WhatsAppOutlined />}
                  block
                  onClick={handleWhatsApp}
                  style={{
                    borderRadius: 8,
                    height: 36,
                    background: '#25D366',
                    borderColor: '#25D366',
                    color: 'white',
                  }}
                >
                  WhatsApp
                </Button>
              )}

              {merchant.email && (
                <Button
                  type="default"
                  icon={<MailOutlined />}
                  block
                  onClick={handleEmail}
                  style={{
                    borderRadius: 8,
                    height: 36,
                    background: '#1890ff',
                    borderColor: '#1890ff',
                    color: 'white',
                  }}
                >
                  {merchant.email}
                </Button>
              )}

              {merchant.address && (
                <Button
                  type="default"
                  icon={<EnvironmentOutlined />}
                  block
                  onClick={handleMaps}
                  style={{
                    borderRadius: 8,
                    height: 36,
                    background: '#eb2f96',
                    borderColor: '#eb2f96',
                    color: 'white',
                  }}
                >
                  {merchant.address}, {merchant.city}
                </Button>
              )}
            </Space>
          </div>

          {/* QR Code */}
          {showQRCode && card && (
            <div
              style={{
                background: 'white',
                borderRadius: 12,
                padding: 12,
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  background: 'white',
                  padding: 8,
                  borderRadius: 8,
                  display: 'inline-block',
                }}
              >
                <QRCode
                  value={card.publicUrl}
                  size={styles.qrSize}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: merchant.logo || '',
                    x: undefined,
                    y: undefined,
                    height: styles.qrSize * 0.2,
                    width: styles.qrSize * 0.2,
                    excavate: true,
                  }}
                />
              </div>
              <Text
                style={{
                  display: 'block',
                  marginTop: 8,
                  fontSize: 10,
                  color: '#999',
                }}
              >
                Scannez pour voir ma carte
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Download PDF Button */}
      {showDownloadButton && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
            loading={isDownloading}
            style={{
              background: useGradient 
                ? `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                : primaryColor,
              border: 'none',
            }}
          >
            Télécharger la carte en PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default MemberCardVisualizer;
