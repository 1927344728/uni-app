import { Button, Card, Drawer, Form, Input, InputNumber, Message, Modal, Select, Space, Spin, Table, Tag } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { request } from '../api/http';
import { ADMIN_ROLE_OPTIONS, CLIENT_ROLE_OPTIONS } from '../config/resources';
import { useAuth } from '../state/auth';

function normalizePage(data) {
  if (Array.isArray(data)) return { list: data, total: data.length };
  return { list: data?.content || [], total: Number(data?.totalElements || 0) };
}

function clientRoleLabel(role) {
  return CLIENT_ROLE_OPTIONS.find((item) => item.value === role)?.label || role || '-';
}

function adminRoleLabel(adminRole) {
  if (adminRole == null) return '无';
  return ADMIN_ROLE_OPTIONS.find((item) => item.value === adminRole)?.label || adminRole;
}

function fillUserForm(form, record) {
  form.setFieldsValue({
    phone: record.phone,
    name: record.name,
    sex: record.sex,
    birthday: record.birthday,
    alias: record.alias,
    nickname: record.nickname,
    email: record.email,
    role: record.role,
    adminRole: record.adminRole ?? undefined,
  });
}

export default function UserPage() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { canButton } = useAuth();
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(50);
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState();
  const [adminRole, setAdminRole] = useState();
  const [editing, setEditing] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create');
  const [formKey, setFormKey] = useState(0);
  const [resetUser, setResetUser] = useState(null);
  const can = (action) => canButton(`system.users.${action}`);

  const load = async (nextPage = page, nextSize = size, nextKeyword = keyword, nextRole = role, nextAdminRole = adminRole) => {
    setLoading(true);
    try {
      const data = await request('/api/admin/users', {
        params: {
          page: nextPage - 1,
          size: nextSize,
          keyword: nextKeyword,
          role: nextRole,
          adminRole: nextAdminRole,
        },
      });
      const normalized = normalizePage(data);
      setRows(normalized.list);
      setTotal(normalized.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      load(1, size, keyword, role, adminRole).catch(() => undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, role, adminRole]);

  useEffect(() => {
    if (!drawerVisible || detailLoading) return;
    if (drawerMode === 'edit' && editing) {
      fillUserForm(form, editing);
    } else if (drawerMode === 'create') {
      form.resetFields();
      form.clearFields();
      form.setFieldsValue({ role: 2, adminRole: undefined });
    }
  }, [drawerVisible, drawerMode, editing, detailLoading, form, formKey]);

  const openCreate = () => {
    setEditing(null);
    setDrawerMode('create');
    setDetailLoading(false);
    setFormKey((key) => key + 1);
    setDrawerVisible(true);
  };

  const openEdit = async (row) => {
    setEditing(null);
    setDrawerMode('edit');
    setDetailLoading(true);
    setDrawerVisible(true);
    form.resetFields();
    try {
      const detail = await request(`/api/admin/users/${row.id}`);
      setEditing(detail);
    } catch {
      setDrawerVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const save = async () => {
    const values = await form.validate();
    const body = {
      ...values,
      adminRole: values.adminRole ?? null,
    };
    await request(editing?.id ? `/api/admin/users/${editing.id}` : '/api/admin/users', {
      method: editing?.id ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    });
    Message.success('保存成功');
    setDrawerVisible(false);
    load().catch(() => undefined);
  };

  const remove = (row) => {
    Modal.confirm({
      title: row.isDeleted ? '确认恢复用户？' : '确认删除用户？',
      content: row.name || row.phone,
      onOk: async () => {
        if (row.isDeleted) {
          const detail = await request(`/api/admin/users/${row.id}`);
          await request(`/api/admin/users/${row.id}`, { method: 'PUT', body: JSON.stringify({ ...detail, isDeleted: false }) });
        } else {
          await request(`/api/admin/users/${row.id}`, { method: 'DELETE' });
        }
        Message.success('操作成功');
        load().catch(() => undefined);
      },
    });
  };

  const resetPassword = async () => {
    const values = await passwordForm.validate();
    await request(`/api/admin/users/${resetUser?.id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password: values.password }),
    });
    Message.success('密码已重置');
    setResetUser(null);
  };

  return (
    <Card className="page-card">
      <div className="toolbar">
        <Space wrap>
          <Input.Search allowClear placeholder="请输入手机号 / 姓名" autoComplete="off" style={{ width: 260 }} value={keyword} onChange={setKeyword} />
          <Select allowClear placeholder="客户端角色" style={{ width: 160 }} options={CLIENT_ROLE_OPTIONS} value={role} onChange={setRole} />
          <Select allowClear placeholder="后台角色" style={{ width: 160 }} options={ADMIN_ROLE_OPTIONS} value={adminRole} onChange={setAdminRole} />
        </Space>
        {can('create') && (
          <Button type="primary" onClick={openCreate}>
            新建
          </Button>
        )}
      </div>
      <Table
        rowKey="id"
        loading={loading}
        data={rows}
        scroll={{ x: true }}
        pagination={{
          current: page,
          pageSize: size,
          total,
          showTotal: true,
          showJumper: true,
          sizeCanChange: true,
          sizeOptions: [20, 50, 100, 200],
          onChange: (current, pageSize) => {
            setPage(current);
            setSize(pageSize);
            load(current, pageSize).catch(() => undefined);
          },
        }}
        columns={[
          { title: '序号', width: 64, align: 'center', render: (_, __, index) => (page - 1) * size + index + 1 },
          { title: 'ID', dataIndex: 'id', width: 72, align: 'center' },
          { title: '手机号', dataIndex: 'phone', width: 150, align: 'center', ellipsis: true },
          { title: '姓名', dataIndex: 'name', width: 96, align: 'center' },
          { title: '昵称', dataIndex: 'nickname', ellipsis: true },
          { title: '别名', dataIndex: 'alias', width: 96, align: 'center' },
          { title: '客户端角色', dataIndex: 'role', width: 110, align: 'center', render: (value) => clientRoleLabel(value) },
          { title: '后台角色', dataIndex: 'adminRole', width: 120, align: 'center', render: (value) => adminRoleLabel(value) },
          { title: '创建时间', dataIndex: 'createdAt', width: 170, align: 'center' },
          { title: '状态', dataIndex: 'isDeleted', width: 88, align: 'center', render: (value) => (value ? <Tag color="red">已删除</Tag> : <Tag color="green">正常</Tag>) },
          {
            title: '操作',
            width: 220,
            align: 'right',
            fixed: 'right',
            render: (_, row) => (
              <div className="table-actions">
                <Space size={8}>
                  {can('edit') && <Button size="mini" onClick={() => openEdit(row)}>编辑</Button>}
                  {can('resetPassword') && <Button size="mini" onClick={() => setResetUser(row)}>重置密码</Button>}
                  {(row.isDeleted ? can('restore') : can('delete')) && (
                    <Button size="mini" status={row.isDeleted ? 'success' : 'danger'} onClick={() => remove(row)}>
                      {row.isDeleted ? '恢复' : '删除'}
                    </Button>
                  )}
                </Space>
              </div>
            ),
          },
        ]}
      />
      <Drawer
        width={560}
        title={drawerMode === 'edit' ? '编辑用户' : '新建用户'}
        visible={drawerVisible}
        unmountOnExit
        confirmLoading={detailLoading}
        onCancel={() => setDrawerVisible(false)}
        onOk={save}
      >
        <Spin loading={detailLoading} style={{ width: '100%', minHeight: 120 }}>
          {!detailLoading && (
            <Form
              key={drawerMode === 'edit' ? `edit-${editing?.id}` : `create-${formKey}`}
              form={form}
              className="drawer-form"
              layout="horizontal"
              autoComplete="off"
              labelCol={{ flex: '8em' }}
              wrapperCol={{ flex: 1 }}
              labelAlign="right"
              initialValues={
                drawerMode === 'edit' && editing
                  ? {
                      phone: editing.phone,
                      name: editing.name,
                      sex: editing.sex,
                      birthday: editing.birthday,
                      alias: editing.alias,
                      nickname: editing.nickname,
                      email: editing.email,
                      role: editing.role,
                      adminRole: editing.adminRole ?? undefined,
                    }
                  : { role: 2 }
              }
            >
              <Form.Item field="phone" label="手机号" rules={[{ required: true, match: /^1\d{10}$/, message: '请输入 11 位手机号' }]}>
                <Input placeholder="请输入手机号" autoComplete="off" />
              </Form.Item>
              <Form.Item field="name" label="姓名">
                <Input placeholder="请输入姓名" autoComplete="off" />
              </Form.Item>
              <Form.Item field="nickname" label="昵称">
                <Input placeholder="请输入昵称" autoComplete="off" />
              </Form.Item>
              <Form.Item field="alias" label="别名">
                <Input placeholder="请输入别名" autoComplete="off" />
              </Form.Item>
              <Form.Item field="sex" label="性别">
                <InputNumber placeholder="请输入性别" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item field="birthday" label="生日">
                <Input placeholder="YYYY-MM-DD" autoComplete="off" />
              </Form.Item>
              <Form.Item field="email" label="邮箱">
                <Input placeholder="请输入邮箱" autoComplete="off" />
              </Form.Item>
              <Form.Item field="role" label="客户端角色" rules={[{ required: true, message: '请选择客户端角色' }]}>
                <Select placeholder="请选择客户端角色" options={CLIENT_ROLE_OPTIONS} />
              </Form.Item>
              <Form.Item field="adminRole" label="后台角色">
                <Select allowClear placeholder="无后台权限" options={ADMIN_ROLE_OPTIONS} disabled={!can('changeRole')} />
              </Form.Item>
            </Form>
          )}
        </Spin>
      </Drawer>
      <Modal title={`重置密码：${resetUser?.name || resetUser?.phone || ''}`} visible={!!resetUser} onCancel={() => setResetUser(null)} onOk={resetPassword}>
        <Form form={passwordForm} className="modal-form" layout="horizontal" autoComplete="off" labelCol={{ flex: '90px' }} wrapperCol={{ flex: 1 }} labelAlign="left">
          <Form.Item field="password" label="新密码" rules={[{ required: true, message: '请输入新密码' }]}>
            <Input.Password placeholder="请输入新密码" autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
