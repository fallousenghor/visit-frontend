import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Spin } from 'antd';
import {
  ShopOutlined,
  EyeOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';

import dayjs from 'dayjs';
import { statsService } from '../services';
import type { DashboardStats } from '../types';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentMerchantsColumns = [
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
      title: 'Statut',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Actif' : 'Inactif'}
        </Tag>
      ),
    },
    {
      title: 'Date création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
  ];

  const recentScansColumns = [
    {
      title: 'Commerce',
      dataIndex: ['merchant', 'businessName'],
      key: 'businessName',
    },
    {
      title: 'Ville',
      dataIndex: ['merchant', 'city'],
      key: 'city',
    },
    {
      title: 'Date scan',
      dataIndex: 'scannedAt',
      key: 'scannedAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        Tableau de bord
      </Title>

      <Row gutter={[16, 16]}>
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
              prefix={<DollarOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Commerçants Récents" variant="borderless">
            <Table
              dataSource={stats?.recentMerchants || []}
              columns={recentMerchantsColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Scans Récents" variant="borderless">
            <Table
              dataSource={stats?.recentScans || []}
              columns={recentScansColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;