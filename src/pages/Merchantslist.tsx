import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  Select,
  Typography,
  App,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMerchantStore } from '../hooks/merchantStore';
import type { Merchant } from '../types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const MerchantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const {
    merchants,
    total,
    page,
    limit,
    isLoading,
    fetchMerchants,
    deleteMerchant,
    toggleMerchantStatus,
  } = useMerchantStore();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    fetchMerchants({ page: 1, limit: 10 });
  }, []);

  const handleSearch = () => {
    fetchMerchants({
      page: 1,
      limit,
      search: searchText,
      isActive: statusFilter,
    });
  };

  const handleTableChange = (pagination: any) => {
    fetchMerchants({
      page: pagination.current,
      limit: pagination.pageSize,
      search: searchText,
      isActive: statusFilter,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMerchant(id);
      message.success('Commerçant supprimé avec succès');
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  };

  const columns: ColumnsType<Merchant> = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo: string, record: Merchant) => (
        <Avatar 
          src={logo} 
          size={50}
          style={{ backgroundColor: logo ? 'transparent' : '#667eea' }}
        >
          {!logo && record.businessName.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: 'Commerce',
      dataIndex: 'businessName',
      key: 'businessName',
      sorter: true,
    },
    {
      title: 'Propriétaire',
      dataIndex: 'ownerName',
      key: 'ownerName',
    },
    {
      title: 'Téléphone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Ville',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => category || '-',
    },
    {
      title: 'Carte',
      key: 'hasCard',
      render: (_, record: Merchant) => (
        record.businessCard ? (
          <Tag color="success" icon={<QrcodeOutlined />}>
            Active
          </Tag>
        ) : (
          <Tag color="default">Aucune</Tag>
        )
      ),
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
      title: 'Scans',
      key: 'scans',
      render: (_, record: Merchant) => record._count?.scans || 0,
    },
    {
      title: 'Date création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record: Merchant) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/merchants/${record.id}`)}
          >
            Voir
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/merchants/${record.id}/edit`)}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce commerçant ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Commerçants</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/merchants/create')}
        >
          Nouveau commerçant
        </Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }} orientation="vertical">
          <Space>
            <Input
              placeholder="Rechercher par nom, téléphone..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Statut"
              style={{ width: 120 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value={true}>Actif</Option>
              <Option value={false}>Inactif</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              Rechercher
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={merchants}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} commerçants`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default MerchantsPage;

