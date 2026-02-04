import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Avatar,
  Typography,
  Space,
  Spin,
  Result,
  message,
} from 'antd';

import {
  PhoneOutlined,
  WhatsAppOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  CheckOutlined,
  StarOutlined,
} from '@ant-design/icons';

import { businessCardService } from '../services';
import type { BusinessCard } from '../types';

const { Title, Text, Paragraph } = Typography;

// Mobile money provider configurations
const MOBILE_MONEY_PROVIDERS = {
  WAVE: {
    name: 'Wave',
    color: '#F37335',
    bgColor: '#FFF5F0',
    gradient: 'linear-gradient(135deg, #F37335 0%, #FF8C42 100%)',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <circle cx="12" cy="12" r="10" fill="#F37335"/>
        <circle cx="12" cy="12" r="7" fill="#fff"/>
        <circle cx="12" cy="12" r="4" fill="#F37335"/>
      </svg>
    ),
    ussd: '*144#',
  },
  ORANGE_MONEY: {
    name: 'Orange Money',
    color: '#FF7900',
    bgColor: '#FFF7F0',
    gradient: 'linear-gradient(135deg, #FF7900 0%, #FF9F3F 100%)',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <rect width="24" height="24" rx="4" fill="#FF7900"/>
        <text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">OM</text>
      </svg>
    ),
    ussd: '*144#',
  },
  FREE_MONEY: {
    name: 'Free Money',
    color: '#722ed1',
    bgColor: '#F5F0FF',
    gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <rect width="24" height="24" rx="4" fill="#722ed1"/>
        <text x="12" y="17" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">FM</text>
      </svg>
    ),
    ussd: '*400#',
  },
};

const PublicCardPage: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (qrCode) {
      loadCard();
    }
  }, [qrCode]);

  const loadCard = async () => {
    try {
      setLoading(true);
      const data = await businessCardService.scanCard(qrCode!);
      setCard(data);
      setError(false);
    } catch (err) {
      console.error('Error loading card:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (card?.merchant?.phoneNumber) {
      window.location.href = `tel:${card.merchant.phoneNumber}`;
    }
  };

  const handleWhatsApp = () => {
    const phone = card?.merchant?.whatsappNumber || card?.merchant?.phoneNumber;
    if (phone) {
      const formattedPhone = phone.startsWith('+') ? phone.replace(/\+/g, '') : `221${phone}`;
      window.open(`https://wa.me/${formattedPhone}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (card?.merchant?.email) {
      window.location.href = `mailto:${card.merchant.email}`;
    }
  };

  const handleMaps = () => {
    if (card?.merchant?.latitude && card?.merchant?.longitude) {
      window.open(
        `https://www.google.com/maps?q=${card.merchant.latitude},${card.merchant.longitude}`,
        '_blank'
      );
    } else if (card?.merchant?.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          card.merchant.address + ', ' + card.merchant.city
        )}`,
        '_blank'
      );
    }
  };

  const handleUSSD = (ussd: string) => {
    window.location.href = `tel:${ussd}`;
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      message.success('Numéro copié !');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      message.error('Impossible de copier');
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[dayOfWeek];
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Spin size="large" indicator={<span style={{ color: 'white' }}>⟳</span>} />
          </div>
          <Text style={{ color: '#666', fontSize: 14 }}>Chargement de la carte...</Text>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
        padding: 20,
      }}>
        <Result
          status="404"
          title="Carte non trouvée"
          subTitle="Cette carte n'existe pas ou a expiré."
        />
      </div>
    );
  }

  const merchant = card.merchant!;
  const primaryColor = merchant.primaryColor || '#667eea';
  const secondaryColor = merchant.secondaryColor || '#764ba2';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .floating-avatar {
          animation: float 3s ease-in-out infinite;
        }
        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 14px 8px;
          border-radius: 16px;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          min-width: 70px;
          position: relative;
          overflow: hidden;
        }
        .action-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%);
        }
        .action-btn:active {
          transform: scale(0.95);
        }
        .payment-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        }
        .payment-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--provider-color);
        }
        .ussd-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: 2px solid;
          background: white;
          transition: all 0.2s;
        }
        .ussd-btn:hover {
          transform: translateY(-2px);
        }
        .ussd-btn:active {
          transform: scale(0.98);
        }
        .copy-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: var(--provider-color);
          color: white;
          transition: all 0.2s;
        }
        .copy-btn:hover {
          opacity: 0.9;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          background: #fafbfc;
          border-radius: 14px;
          margin-bottom: 10px;
        }
        .contact-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255,255,255,0.2);
          color: white;
        }
        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255,255,255,0.2);
          color: white;
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        padding: '30px 20px 50px',
        borderRadius: '0 0 30px 30px',
        position: 'relative',
      }}>
        {/* Avatar */}
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div className="floating-avatar" style={{ display: 'inline-block', position: 'relative' }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Avatar
                src={merchant.logo}
                size={64}
                style={{ 
                  border: '3px solid white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                }}
              >
                {merchant.businessName.charAt(0)}
              </Avatar>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 6,
            marginBottom: 6,
          }}>
            <Title level={3} style={{ 
              color: 'white', 
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
            }}>
              {merchant.businessName}
            </Title>
            {merchant.isVerified && (
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ color: primaryColor, fontSize: 12 }}>✓</span>
              </div>
            )}
          </div>
          
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, display: 'block', marginBottom: 8 }}>
            {merchant.ownerName}
          </Text>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {merchant.category && (
              <span className="category-badge" style={{ padding: '4px 10px', fontSize: 12 }}>
                {merchant.category}
              </span>
            )}
            {merchant.isVerified && (
              <span className="verified-badge" style={{ padding: '4px 10px', fontSize: 12 }}>
                <StarOutlined /> Vérifié
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Floating */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 16,
        marginTop: -28,
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Call */}
        <button 
          onClick={handleCall}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#25D366',
            border: '3px solid white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
          }}
        >
          <PhoneOutlined style={{ fontSize: 24, color: 'white' }} />
        </button>
        
        {/* WhatsApp */}
        <button 
          onClick={handleWhatsApp}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#25D366',
            border: '3px solid white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
          }}
        >
          <WhatsAppOutlined style={{ fontSize: 24, color: 'white' }} />
        </button>
        
        {/* Email */}
        <button 
          onClick={handleEmail}
          disabled={!merchant.email}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: merchant.email ? '#1890ff' : '#ccc',
            border: '3px solid white',
            cursor: merchant.email ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: merchant.email ? '0 4px 15px rgba(24, 144, 255, 0.4)' : 'none',
          }}
        >
          <MailOutlined style={{ fontSize: 24, color: 'white' }} />
        </button>
        
        {/* Maps */}
        <button 
          onClick={handleMaps}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#eb2f96',
            border: '3px solid white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(235, 47, 150, 0.4)',
          }}
        >
          <EnvironmentOutlined style={{ fontSize: 24, color: 'white' }} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px 40px' }}>
        
        {/* Contact Info */}
        <div style={{ marginBottom: 20 }}>
          <Title level={5} style={{ marginBottom: 16, color: '#1a1a2e', fontSize: 18, fontWeight: 700 }}>
            Coordonnées
          </Title>
          
          {/* Phone */}
          <div className="contact-item" style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)` }}>
            <div className="contact-icon" style={{ background: primaryColor }}>
              <PhoneOutlined style={{ fontSize: 22, color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Téléphone</Text>
              <Text strong style={{ display: 'block', fontSize: 17, color: '#1a1a2e' }}>{merchant.phoneNumber}</Text>
            </div>
           
          </div>

          {/* Email */}
          {merchant.email && (
            <div className="contact-item" style={{ background: '#f0f7ff' }}>
              <div className="contact-icon" style={{ background: '#1890ff' }}>
                <MailOutlined style={{ fontSize: 22, color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Email</Text>
                <Text strong style={{ display: 'block', fontSize: 15, color: '#1a1a2e' }}>{merchant.email}</Text>
              </div>
              
            </div>
          )}

          {/* Address */}
          <div className="contact-item" style={{ background: '#fff0f7' }}>
            <div className="contact-icon" style={{ background: '#eb2f96' }}>
              <EnvironmentOutlined style={{ fontSize: 22, color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Adresse</Text>
              <Text strong style={{ display: 'block', fontSize: 14, color: '#1a1a2e' }}>
                {merchant.address ? `${merchant.address}, ` : ''}
                {merchant.city}
              </Text>
            </div>
           
          </div>
        </div>

        {/* Opening Hours */}
        {card.merchant?.openingHours && card.merchant.openingHours.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              background: 'white',
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10,
                marginBottom: 16,
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ClockCircleOutlined style={{ fontSize: 18, color: 'white' }} />
                </div>
                <Title level={5} style={{ margin: 0, color: '#1a1a2e', fontSize: 18, fontWeight: 700 }}>
                  Horaires d'ouverture
                </Title>
              </div>
              
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                {card.merchant!.openingHours!.map((hours) => (
                  <div 
                    key={hours.id}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <Text strong style={{ 
                      color: hours.isClosed ? '#999' : '#1a1a2e',
                      fontSize: 15,
                    }}>
                      {getDayName(hours.dayOfWeek)}
                    </Text>
                    <Text style={{ 
                      color: hours.isClosed ? '#999' : primaryColor,
                      fontWeight: 600,
                      fontSize: 14,
                    }}>
                      {hours.isClosed ? 'Fermé' : `${hours.openTime} - ${hours.closeTime}`}
                    </Text>
                  </div>
                ))}
              </Space>
            </div>
          </div>
        )}

        {/* Mobile Money Payments */}
        {card.merchant?.paymentMethods && card.merchant.paymentMethods.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <Title level={5} style={{ marginBottom: 16, color: '#1a1a2e', fontSize: 18, fontWeight: 700 }}>
              💰 Paiement Mobile Money
            </Title>
            
            {card.merchant.paymentMethods.map((payment) => {
              const provider = MOBILE_MONEY_PROVIDERS[payment.paymentMethod as keyof typeof MOBILE_MONEY_PROVIDERS];
              if (!provider) return null;
              
              return (
                <div 
                  key={payment.id} 
                  className="payment-card"
                  style={{ '--provider-color': provider.color } as React.CSSProperties}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 14,
                    marginBottom: 16,
                  }}>
                    <div style={{ 
                      width: 52, 
                      height: 52, 
                      borderRadius: 14, 
                      background: provider.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {provider.icon}
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 17, color: '#1a1a2e' }}>{provider.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {payment.accountName}
                      </Text>
                    </div>
                  </div>
                  
                  {/* Account Number */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: provider.bgColor,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}>
                    <Text strong style={{ fontSize: 20, letterSpacing: 1, color: provider.color }}>
                      {payment.accountNumber}
                    </Text>
                    <button 
                      className="copy-btn"
                      style={{ '--provider-color': provider.color } as React.CSSProperties}
                      onClick={() => copyToClipboard(payment.accountNumber, payment.id)}
                    >
                      {copiedId === payment.id ? (
                        <CheckOutlined style={{ fontSize: 14 }} />
                      ) : (
                        <CopyOutlined style={{ fontSize: 14 }} />
                      )}
                      {copiedId === payment.id ? 'Copié!' : 'Copier'}
                    </button>
                  </div>
                  
                  {/* USSD Button */}
                  <button 
                    className="ussd-btn"
                    onClick={() => handleUSSD(provider.ussd)}
                    style={{ borderColor: provider.color, color: provider.color }}
                  >
                    <span style={{ fontWeight: 700 }}>{provider.ussd}</span>
                    <span style={{ fontSize: 12 }}>pour payer</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Description */}
        {merchant.description && (
          <div style={{ 
            background: 'white',
            borderRadius: 20,
            padding: 20,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <Title level={5} style={{ marginBottom: 12, color: '#1a1a2e', fontSize: 18, fontWeight: 700 }}>
              À propos
            </Title>
            <Paragraph style={{ color: '#666', marginBottom: 0, lineHeight: 1.7, fontSize: 15 }}>
              {merchant.description}
            </Paragraph>
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          padding: '32px 0 16px',
          color: '#999',
        }}>
          <Text style={{ fontSize: 13 }}>
            Smart Business Card
          </Text>
        </div>
      </div>
    </div>
  );
};

export default PublicCardPage;

