import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Row,
  Col,
  Select,
  Typography,
  ColorPicker,
  App,
  Switch,
} from 'antd';
import { UploadOutlined, ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useMerchantStore } from '../hooks/merchantStore';
import type { UploadFile } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const categories = [
  'Restaurant',
  'Coiffure',
  'Mécanique',
  'Menuiserie',
  'Plomberie',
  'Électricité',
  'Commerce',
  'Services',
  'Autre',
];

const MerchantForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { message } = App.useApp();

  const { createMerchant, updateMerchant, fetchMerchantById, currentMerchant, isLoading } =
    useMerchantStore();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [logoFile, setLogoFile] = useState<File | undefined>();

  useEffect(() => {
    if (isEditMode && id) {
      fetchMerchantById(id);
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (currentMerchant && isEditMode) {
      form.setFieldsValue({
        businessName: currentMerchant.businessName,
        ownerName: currentMerchant.ownerName,
        phoneNumber: currentMerchant.phoneNumber,
        whatsappNumber: currentMerchant.whatsappNumber,
        email: currentMerchant.email,
        description: currentMerchant.description,
        category: currentMerchant.category,
        address: currentMerchant.address,
        city: currentMerchant.city,
        primaryColor: currentMerchant.primaryColor,
        secondaryColor: currentMerchant.secondaryColor,
        useGradient: currentMerchant.useGradient,
      });

      if (currentMerchant.logo) {
        setFileList([
          {
            uid: '-1',
            name: 'logo.png',
            status: 'done',
            url: currentMerchant.logo,
          },
        ]);
      }
    }
  }, [currentMerchant, isEditMode, form]);

  const onFinish = async (values: any) => {
    try {
      // Extraire la couleur correctement du ColorPicker (qui renvoie un objet Color)
      const primaryColor = values.primaryColor?.toHexString 
        ? values.primaryColor.toHexString() 
        : values.primaryColor;
      
      const secondaryColor = values.secondaryColor?.toHexString 
        ? values.secondaryColor.toHexString() 
        : values.secondaryColor;
      
      const formData = {
        ...values,
        primaryColor,
        secondaryColor,
      };
      
      if (isEditMode && id) {
        await updateMerchant(id, formData, logoFile);
        message.success('Commerçant modifié avec succès');
      } else {
        await createMerchant(formData, logoFile);
        message.success('Commerçant créé avec succès');
      }
      navigate('/merchants');
    } catch (error) {
      message.error('Une erreur est survenue');
    }
  };

  const handleUploadChange = (info: any) => {
    setFileList(info.fileList.slice(-1));
    
    // Use the file directly when beforeUpload returns false
    const file = info.file.originFileObj || info.file;
    if (file) {
      setLogoFile(file);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Vous ne pouvez télécharger que des images');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('L\'image doit être inférieure à 2MB');
      return false;
    }
    return false; // Prevent auto upload
  };

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/merchants')}
        style={{ marginBottom: 16 }}
      >
        Retour
      </Button>

      <Card>
        <Title level={3} style={{ marginBottom: 24 }}>
          {isEditMode ? 'Modifier le commerçant' : 'Nouveau commerçant'}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          initialValues={{ city: 'Dakar', primaryColor: '#667eea' }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="businessName"
                label="Nom du commerce"
                rules={[{ required: true, message: 'Ce champ est requis' }]}
              >
                <Input placeholder="Ex: Boutique Diallo" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="ownerName"
                label="Nom du propriétaire"
                rules={[{ required: true, message: 'Ce champ est requis' }]}
              >
                <Input placeholder="Ex: Mamadou Diallo" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="phoneNumber"
                label="Numéro de téléphone"
                rules={[
                  { required: true, message: 'Ce champ est requis' },
                  {
                    pattern: /^(\+221)?[0-9]{9}$/,
                    message: 'Numéro invalide (9 chiffres)',
                  },
                ]}
              >
                <Input placeholder="Ex: 775551234" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="whatsappNumber" label="Numéro WhatsApp">
                <Input placeholder="Ex: 775551234" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Email invalide' }]}
              >
                <Input placeholder="Ex: contact@boutique.sn" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="category" label="Catégorie">
                <Select placeholder="Sélectionner une catégorie">
                  {categories.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="city" label="Ville">
                <Input placeholder="Ex: Dakar" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="address" label="Adresse">
                <Input placeholder="Ex: Médina, Rue 10" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="description" label="Description">
                <TextArea
                  rows={4}
                  placeholder="Décrivez votre commerce..."
                  maxLength={500}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Logo">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={beforeUpload}
                  maxCount={1}
                >
                  {fileList.length === 0 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Télécharger</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="primaryColor" label="Couleur primaire">
                <ColorPicker
                  format="hex"
                  showText
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="secondaryColor" label="Couleur secondaire">
                <ColorPicker
                  format="hex"
                  showText
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="useGradient" label="Utiliser un dégradé" valuePropName="checked">
                <Switch checkedChildren="Oui" unCheckedChildren="Non" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Télécharger la carte">
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    // Trigger PDF download with current form values
                    const primaryColor = form.getFieldValue('primaryColor');
                    const secondaryColor = form.getFieldValue('secondaryColor');
                    const useGradient = form.getFieldValue('useGradient');
                    
                    // Dispatch custom event for PDF generation
                    window.dispatchEvent(new CustomEvent('download-pdf', {
                      detail: { primaryColor, secondaryColor, useGradient }
                    }));
                  }}
                >
                  Télécharger la carte en PDF
                </Button>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} size="large">
              {isEditMode ? 'Mettre à jour' : 'Créer'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MerchantForm;

