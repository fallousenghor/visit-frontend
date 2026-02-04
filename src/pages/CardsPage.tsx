import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Image,
  Typography,
  Modal,
  Popconfirm,
  App,
} from 'antd';
import {
  QrcodeOutlined,
  EyeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  DeleteOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { merchantService, businessCardService } from '../services';
import type { Merchant, BusinessCard } from '../types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import QRCode from 'qrcode.react';
import PrintableCard from '../components/PrintableCard';

const { Title } = Typography;

interface MerchantWithCard extends Merchant {
  businessCard?: BusinessCard;
}

const CardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [merchants, setMerchants] = useState<MerchantWithCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantWithCard | null>(null);
  const [printModalVisible, setPrintModalVisible] = useState(false);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      setLoading(true);
      const { data } = await merchantService.getAll({ limit: 100 });
      setMerchants(data);
    } catch (error) {
      message.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQR = (card: BusinessCard) => {
    setSelectedCard(card);
    setQrModalVisible(true);
  };

  const handleViewCard = (merchant: MerchantWithCard) => {
    setSelectedMerchant(merchant);
    setPrintModalVisible(true);
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector('#modal-qr-code canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-${selectedCard?.merchant?.businessName}.png`;
      link.href = url;
      link.click();
    }
  };

  const handleCreateCard = async (merchantId: string) => {
    try {
      await businessCardService.create({
        merchantId,
        cardType: 'BASIC',
      });
      message.success('Carte créée avec succès');
      loadMerchants();
    } catch (error) {
      message.error('Erreur lors de la création de la carte');
    }
  };

  const handleRegenerateQR = async (cardId: string) => {
    try {
      await businessCardService.regenerateQRCode(cardId);
      message.success('QR code régénéré avec succès');
      loadMerchants();
    } catch (error) {
      message.error('Erreur lors de la régénération');
    }
  };

  const handleRenewCard = async (cardId: string) => {
    try {
      await businessCardService.renewCard(cardId, 12);
      message.success('Carte renouvelée pour 12 mois');
      loadMerchants();
    } catch (error) {
      message.error('Erreur lors du renouvellement');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await businessCardService.delete(cardId);
      message.success('Carte supprimée avec succès');
      loadMerchants();
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  };

  const columns: ColumnsType<MerchantWithCard> = [
    {
      title: 'Commerce',
      dataIndex: 'businessName',
      key: 'businessName',
      render: (name: string, record) => (
        <Space>
          {record.logo && <Image src={record.logo} width={40} preview={false} />}
          {name}
        </Space>
      ),
    },
    {
      title: 'Propriétaire',
      dataIndex: 'ownerName',
      key: 'ownerName',
    },
    {
      title: 'Ville',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Type de carte',
      key: 'cardType',
      render: (_, record) =>
        record.businessCard ? (
          <Tag color="blue">{record.businessCard.cardType}</Tag>
        ) : (
          <Tag>Aucune carte</Tag>
        ),
    },
    {
      title: 'Statut',
      key: 'cardStatus',
      render: (_, record) => {
        if (!record.businessCard) {
          return <Tag>Non créée</Tag>;
        }
        const isExpired = dayjs().isAfter(dayjs(record.businessCard.expiresAt));
        if (isExpired) {
          return <Tag color="error">Expirée</Tag>;
        }
        return record.businessCard.isActive ? (
          <Tag color="success">Active</Tag>
        ) : (
          <Tag color="warning">Inactive</Tag>
        );
      },
    },
    {
      title: 'Expiration',
      key: 'expiration',
      render: (_, record) =>
        record.businessCard
          ? dayjs(record.businessCard.expiresAt).format('DD/MM/YYYY')
          : '-',
    },
    {
      title: 'QR Code',
      key: 'qrCode',
      render: (_, record) =>
        record.businessCard ? (
          <Image
            src={record.businessCard.qrCodeImage}
            width={50}
            preview={false}
            style={{ cursor: 'pointer' }}
            onClick={() => handleViewQR(record.businessCard!)}
          />
        ) : (
          '-'
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 300,
      render: (_, record) =>
        record.businessCard ? (
          <Space size="small" wrap>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/merchants/${record.id}`)}
            >
              Voir
            </Button>
            <Button
              type="link"
              icon={<QrcodeOutlined />}
              onClick={() => handleViewQR(record.businessCard!)}
            >
              QR
            </Button>
            <Button
              type="link"
              icon={<PrinterOutlined />}
              onClick={() => handleViewCard(record)}
            >
              Imprimer
            </Button>
            <Popconfirm
              title="Régénérer le QR code ?"
              description="L'ancien QR code ne fonctionnera plus"
              onConfirm={() => handleRegenerateQR(record.businessCard!.id)}
              okText="Oui"
              cancelText="Non"
            >
              <Button type="link" icon={<ReloadOutlined />}>
                Régénérer
              </Button>
            </Popconfirm>
            <Button
              type="link"
              icon={<CalendarOutlined />}
              onClick={() => handleRenewCard(record.businessCard!.id)}
            >
              Renouveler
            </Button>
            <Popconfirm
              title="Supprimer la carte ?"
              onConfirm={() => handleDeleteCard(record.businessCard!.id)}
              okText="Oui"
              cancelText="Non"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Supprimer
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <Button
            type="primary"
            size="small"
            onClick={() => handleCreateCard(record.id)}
          >
            Créer une carte
          </Button>
        ),
    },
  ];

  return (
    <div>
      <Title level={2}>Cartes de visite</Title>

      <Card>
        <Table
          columns={columns}
          dataSource={merchants}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} commerçants`,
          }}
        />
      </Card>

      {/* QR Code Modal */}
      <Modal
        title={`QR Code - ${selectedCard?.merchant?.businessName}`}
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setQrModalVisible(false)}>
            Fermer
          </Button>,
          <Button key="download" type="primary" onClick={handleDownloadQR}>
            Télécharger
          </Button>,
        ]}
        width={500}
      >
        {selectedCard && (
          <div>
            <div id="modal-qr-code" style={{ textAlign: 'center', marginBottom: 16 }}>
              <QRCode value={selectedCard.publicUrl} size={350} level="H" />
            </div>
            <Card size="small">
              <p>
                <strong>URL publique:</strong>
                <br />
                <a href={selectedCard.publicUrl} target="_blank" rel="noopener noreferrer">
                  {selectedCard.publicUrl}
                </a>
              </p>
              <p>
                <strong>Type:</strong> {selectedCard.cardType}
              </p>
              <p>
                <strong>Expire le:</strong>{' '}
                {dayjs(selectedCard.expiresAt).format('DD/MM/YYYY')}
              </p>
            </Card>
          </div>
        )}
      </Modal>

      {/* Print Card Modal */}
      <Modal
        title={`Carte imprimable - ${selectedMerchant?.businessName}`}
        open={printModalVisible}
        onCancel={() => setPrintModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedMerchant && selectedMerchant.businessCard && (
          <div style={{ textAlign: 'center' }}>
            <PrintableCard
              merchant={selectedMerchant}
              card={selectedMerchant.businessCard}
              size="standard"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CardsPage;