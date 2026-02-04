import React from 'react';
import { Card, Form, Input, Button, Typography, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '../hooks/authStore';
import { authService } from '../services';


const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loadingProfile, setLoadingProfile] = React.useState(false); 
  const [loadingPassword, setLoadingPassword] = React.useState(false);
  const { message } = App.useApp();

  React.useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user, profileForm]);

  const onUpdateProfile = async (values: { firstName: string; lastName: string }) => {
    try {
      setLoadingProfile(true);
      await updateUser(values);
      message.success('Profil mis à jour avec succès');
    } catch (error) {
      message.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoadingProfile(false);
    }
  };

  const onChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      setLoadingPassword(true);
      await authService.changePassword(values);
      message.success('Mot de passe modifié avec succès');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Erreur lors du changement de mot de passe');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Mon Profil</Title>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>
          <UserOutlined /> Informations personnelles
        </Title>
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={onUpdateProfile}
          size="large"
        >
          <Form.Item
            name="firstName"
            label="Prénom"
            rules={[{ required: true, message: 'Le prénom est requis' }]}
          >
            <Input placeholder="Prénom" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Nom" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input placeholder="Email" disabled />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loadingProfile}>
              Mettre à jour
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Title level={4}>
          <LockOutlined /> Changer le mot de passe
        </Title>
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={onChangePassword}
          size="large"
        >
          <Form.Item
            name="currentPassword"
            label="Mot de passe actuel"
            rules={[
              { required: true, message: 'Le mot de passe actuel est requis' },
            ]}
          >
            <Input.Password placeholder="Mot de passe actuel" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Nouveau mot de passe"
            rules={[
              { required: true, message: 'Le nouveau mot de passe est requis' },
              { min: 6, message: 'Minimum 6 caractères' },
            ]}
          >
            <Input.Password placeholder="Nouveau mot de passe" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmer le mot de passe"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Veuillez confirmer le mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('Les mots de passe ne correspondent pas')
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirmer le mot de passe" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loadingPassword}>
              Changer le mot de passe
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;

