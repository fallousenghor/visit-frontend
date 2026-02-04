import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Select,
  DatePicker,
  Space,
  Tag,
} from 'antd';
import {
  EyeOutlined,
  RiseOutlined,
  ShopOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { statsService } from '../services';
import type { DashboardStats } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topMerchants, setTopMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadTopMerchants();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopMerchants = async () => {
    try {
      const data = await statsService.getTopMerchants(10);
      setTopMerchants(data);
    } catch (error) {
      console.error('Error loading top merchants:', error);
    }
  };

  const topMerchantsColumns = [
    {
      title: 'Position',
      key: 'position',
      render: (_: any, __: any, index: number) => {
        const medals = ['🥇', '🥈', '🥉'];
        return index < 3 ? medals[index] : index + 1;
      },
      width: 80,
    },
    {
      title: 'Commerce',
      dataIndex: 'businessName',
      key: 'businessName',
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
      dataIndex: 'cardType',
      key: 'cardType',
      render: (type: string) => (
        <Tag color={type === 'ENTERPRISE' ? 'purple' : type === 'PREMIUM' ? 'cyan' : 'blue'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Total Scans',
      dataIndex: 'totalScans',
      key: 'totalScans',
      render: (scans: number) => (
        <strong style={{ color: '#1890ff' }}>{scans}</strong>
      ),
      sorter: (a: any, b: any) => a.totalScans - b.totalScans,
    },
  ];

  // Données pour le graphique en colonnes (scans par jour)
  const scansByDayData =
    stats?.recentScans
      .reduce((acc: any[], scan) => {
        const date = dayjs(scan.scannedAt).format('DD/MM');
        const existing = acc.find((item) => item.date === date);
        if (existing) {
          existing.scans++;
        } else {
          acc.push({ date, scans: 1 });
        }
        return acc;
      }, [])
      .slice(-7) || [];

  // Données pour le graphique circulaire (répartition par ville)
  const cityData =
    topMerchants.reduce((acc: any[], merchant) => {
      const existing = acc.find((item) => item.city === merchant.city);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ city: merchant.city, value: 1 });
      }
      return acc;
    }, []) || [];

  const columnConfig = {
    data: scansByDayData,
    xField: 'date',
    yField: 'scans',
    label: {
      position: 'top' as const,
      style: {
        fill: '#1890ff',
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      date: {
        alias: 'Date',
      },
      scans: {
        alias: 'Scans',
      },
    },
  };

  const pieConfig = {
    data: cityData,
    angleField: 'value',
    colorField: 'city',
    radius: 0.8,
    label: {
      type: 'outer' as const,
      content: '{name} ({percentage})',
    },
    interactions: [
      {
        type: 'element-active' as const,
      },
    ],
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={2}>Statistiques détaillées</Title>
        <Space>
          <RangePicker />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Select.Option value="all">Tout</Select.Option>
            <Select.Option value="today">Aujourd'hui</Select.Option>
            <Select.Option value="week">Cette semaine</Select.Option>
            <Select.Option value="month">Ce mois</Select.Option>
          </Select>
        </Space>
      </Space>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Commerçants"
              value={stats?.totalMerchants || 0}
              prefix={<ShopOutlined />}
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Commerçants Actifs"
              value={stats?.activeMerchants || 0}
              prefix={<RiseOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Scans"
              value={stats?.totalScans || 0}
              prefix={<EyeOutlined />}
              styles={{ content: { color: '#cf1322' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenus (FCFA)"
              value={stats?.totalRevenue || 0}
              prefix="💰"
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Graphiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Scans des 7 derniers jours" bordered={false}>
            {scansByDayData.length > 0 ? (
              <Column {...columnConfig} />
            ) : (
              <p style={{ textAlign: 'center', padding: 40 }}>Aucune donnée</p>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Répartition par ville" bordered={false}>
            {cityData.length > 0 ? (
              <Pie {...pieConfig} />
            ) : (
              <p style={{ textAlign: 'center', padding: 40 }}>Aucune donnée</p>
            )}
          </Card>
        </Col>
      </Row>

      {/* Top Merchants */}
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: '#faad14' }} />
            Top 10 des commerçants
          </Space>
        }
        bordered={false}
      >
        <Table
          columns={topMerchantsColumns}
          dataSource={topMerchants}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default StatisticsPage;
