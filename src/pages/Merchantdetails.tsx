import React, { useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Avatar,
  Tabs,
  Table,
  Image,
  Row,
  Col,
  Statistic,
  Spin,
  Modal,
  App,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  QrcodeOutlined,
  BarChartOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useMerchantStore } from '../hooks/merchantStore';
import { businessCardService } from '../services/businessCard.service';
import { statsService } from '../services/stats.service';
import type { BusinessCard, MerchantStats } from '../types';
import QRCode from 'qrcode.react';
import dayjs from 'dayjs';

const MerchantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentMerchant, fetchMerchantById, isLoading } = useMerchantStore();
  const { message } = App.useApp();

  const [card, setCard] = useState<BusinessCard | null>(null);
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMerchantById(id);
      loadBusinessCard();
      loadStats();
    }
  }, [id]);

  const loadBusinessCard = async () => {
    if (!id) return;
    try {
      setLoadingCard(true);
      const cardData = await businessCardService.getByMerchantId(id);
      setCard(cardData);
    } catch (error) {
      // Card not found is expected - user can create one
    } finally {
      setLoadingCard(false);
    }
  };

  const loadStats = async () => {
    if (!id) return;
    try {
      setLoadingStats(true);
      const statsData = await statsService.getMerchantStats(id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreateCard = async () => {
    if (!id) return;
    try {
      await businessCardService.create({
        merchantId: id,
        cardType: 'BASIC',
      });
      message.success('Carte créée avec succès');
      loadBusinessCard();
    } catch (error) {
      message.error('Erreur lors de la création de la carte');
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector('#qr-code-canvas canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-${currentMerchant?.businessName}.png`;
      link.href = url;
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentMerchant) {
    return <div>Commerçant non trouvé</div>;
  }

  const scanColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Nombre de scans',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/merchants')}
        style={{ marginBottom: 16 }}
      >
        Retour
      </Button>

      <Row gutter={[16, 16]}>
        {/* Header Card */}
        <Col xs={24}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Avatar src={currentMerchant.logo} size={100}>
                {currentMerchant.businessName.charAt(0)}
              </Avatar>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0 }}>{currentMerchant.businessName}</h2>
                <p style={{ margin: '8px 0', color: '#666' }}>
                  {currentMerchant.ownerName}
                </p>
                <Space>
                  <Tag color={currentMerchant.isActive ? 'success' : 'error'}>
                    {currentMerchant.isActive ? 'Actif' : 'Inactif'}
                  </Tag>
                  {currentMerchant.isVerified && <Tag color="blue">Vérifié</Tag>}
                  {currentMerchant.category && (
                    <Tag>{currentMerchant.category}</Tag>
                  )}
                </Space>
              </div>
              <div>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/merchants/${id}/edit`)}
                >
                  Modifier
                </Button>
              </div>
            </div>
          </Card>
        </Col>

        {/* Stats Cards */}
        {stats && (
          <>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Scans"
                  value={stats.totalScans}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Aujourd'hui"
                  value={stats.scansToday}
                  styles={{ content: { color: '#3f8600' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Cette semaine"
                  value={stats.scansThisWeek}
                  styles={{ content: { color: '#1890ff' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Ce mois"
                  value={stats.scansThisMonth}
                  styles={{ content: { color: '#cf1322' } }}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Tabs
          items={[
            {
              key: '1',
              label: 'Informations',
              children: (
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Commerce" span={1}>
                    {currentMerchant.businessName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Propriétaire" span={1}>
                    {currentMerchant.ownerName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Téléphone" span={1}>
                    <Space>
                      <PhoneOutlined />
                      {currentMerchant.phoneNumber}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="WhatsApp" span={1}>
                    {currentMerchant.whatsappNumber || '-'}
                  </Descriptions.Item>
                  {currentMerchant.email && (
                    <Descriptions.Item label="Email" span={1}>
                      <Space>
                        <MailOutlined />
                        {currentMerchant.email}
                      </Space>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Catégorie" span={1}>
                    {currentMerchant.category || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ville" span={1}>
                    <Space>
                      <EnvironmentOutlined />
                      {currentMerchant.city}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Pays" span={1}>
                    {currentMerchant.country}
                  </Descriptions.Item>
                  {currentMerchant.address && (
                    <Descriptions.Item label="Adresse" span={2}>
                      {currentMerchant.address}
                    </Descriptions.Item>
                  )}
                  {currentMerchant.description && (
                    <Descriptions.Item label="Description" span={2}>
                      {currentMerchant.description}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Date de création" span={1}>
                    {dayjs(currentMerchant.createdAt).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dernière mise à jour" span={1}>
                    {dayjs(currentMerchant.updatedAt).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: '2',
              label: (
                <span>
                  <QrcodeOutlined /> Carte de visite
                </span>
              ),
              children: loadingCard ? (
                <Spin />
              ) : card ? (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="QR Code">
                      <div id="qr-code-canvas" style={{ textAlign: 'center' }}>
                        <Image
                          src={card.qrCodeImage}
                          alt="QR Code"
                          width={250}
                          preview={false}
                        />
                        <div style={{ marginTop: 16 }}>
                          <Space>
                            <Button onClick={() => setQrModalVisible(true)}>
                              Agrandir
                            </Button>
                            <Button type="primary" onClick={handleDownloadQR}>
                              Télécharger
                            </Button>
                          </Space>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Informations de la carte">
                      <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Type">
                          <Tag color="blue">{card.cardType}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Statut">
                          <Tag color={card.isActive ? 'success' : 'error'}>
                            {card.isActive ? 'Active' : 'Inactive'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="NFC">
                          {card.nfcEnabled ? 'Activé' : 'Désactivé'}
                        </Descriptions.Item>
                        <Descriptions.Item label="URL publique">
                          <a href={card.publicUrl} target="_blank" rel="noopener noreferrer">
                            {card.publicUrl}
                          </a>
                        </Descriptions.Item>
                        <Descriptions.Item label="Date d'activation">
                          {dayjs(card.activatedAt).format('DD/MM/YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Date d'expiration">
                          {dayjs(card.expiresAt).format('DD/MM/YYYY')}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p>Aucune carte de visite créée</p>
                  <Button type="primary" onClick={handleCreateCard}>
                    Créer une carte
                  </Button>
                </div>
              ),
            },
            {
              key: '3',
              label: (
                <span>
                  <BarChartOutlined /> Statistiques
                </span>
              ),
              children: loadingStats ? (
                <Spin />
              ) : stats ? (
                <div>
                  <Table
                    columns={scanColumns}
                    dataSource={stats.scansByDay}
                    rowKey="date"
                    pagination={false}
                  />
                </div>
              ) : (
                <p>Aucune statistique disponible</p>
              ),
            },
          ]}
        />
      </Card>

      {/* QR Code Modal */}
      <Modal
        title="QR Code"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        width={400}
      >
        {card && (
          <div style={{ textAlign: 'center' }}>
            <QRCode value={card.publicUrl} size={300} level="H" />
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={handleDownloadQR}>
                Télécharger
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MerchantDetails;