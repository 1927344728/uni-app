import { Button, Card, Form, Input, Message, Typography } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    document.title = '登录·一兆轻知';
  }, []);

  return (
    <div className="login-page">
      <Card className="login-card" bordered={false}>
        <Typography.Title heading={3} className="login-heading">一兆轻知管理后台</Typography.Title>
        <Typography.Paragraph type="secondary" className="login-heading">管理员账号登录，请使用手机号。</Typography.Paragraph>
        <Form
          layout="horizontal"
          autoComplete="off"
          labelCol={{ flex: '100px' }}
          wrapperCol={{ flex: 1 }}
          labelAlign="right"
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await login(values.phone, values.password);
              Message.success('登录成功');
              navigate('/', { replace: true });
            } finally {
              setLoading(false);
            }
          }}
        >
          <Form.Item
            field="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { match: /^1\d{10}$/, message: '请输入 11 位手机号' },
            ]}
          >
            <Input placeholder="请输入 11 位手机号" allowClear maxLength={11} autoComplete="off" />
          </Form.Item>
          <Form.Item field="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" allowClear autoComplete="off" />
          </Form.Item>
          <Button type="primary" htmlType="submit" long loading={loading}>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}
