import { Button, Card, Checkbox, Message, Select, Spin, Table, Typography } from '@arco-design/web-react';
import { useEffect, useMemo, useState } from 'react';
import { request } from '../api/http';
import { BUTTONS, PAGE_PERMISSIONS } from '../config/resources';

function toButtonMap(values) {
  return values.reduce((map, permission) => {
    const parts = permission.split('.');
    const page = parts.slice(0, -1).join('.');
    const button = parts[parts.length - 1];
    map[page] = [...(map[page] || []), button];
    return map;
  }, {});
}

function toggleInList(list, value, checked) {
  if (checked) return [...new Set([...list, value])];
  return list.filter((item) => item !== value);
}

export default function PermissionPage() {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState();
  const [pages, setPages] = useState([]);
  const [buttons, setButtons] = useState([]);

  const selectedUser = useMemo(() => admins.find((item) => item.id === selectedUserId), [admins, selectedUserId]);

  const buttonColumns = useMemo(() => {
    const usedKeys = new Set();
    PAGE_PERMISSIONS.forEach((page) => {
      page.buttons.forEach((button) => {
        const shortKey = button.key.split('.').pop();
        usedKeys.add(shortKey);
      });
    });
    return BUTTONS.filter((button) => usedKeys.has(button.key));
  }, []);

  useEffect(() => {
    setLoading(true);
    request('/api/admin/users', { params: { adminRole: 2, size: 200 } })
      .then((data) => {
        const list = Array.isArray(data) ? data : data.content || [];
        setAdmins(list);
        if (list[0]) setSelectedUserId(list[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    setLoading(true);
    request(`/api/admin/users/${selectedUserId}/permissions`)
      .then((data) => {
        setPages(data.pages || []);
        if (Array.isArray(data.buttons)) {
          setButtons(data.buttons);
        } else {
          const next = [];
          Object.entries(data.buttons || {}).forEach(([page, values]) => values.forEach((button) => next.push(`${page}.${button}`)));
          setButtons(next);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedUserId]);

  const save = async () => {
    if (!selectedUserId) return;
    await request(`/api/admin/users/${selectedUserId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ pages, buttons, buttonMap: toButtonMap(buttons) }),
    });
    Message.success('权限已保存');
  };

  const togglePage = (pageKey, checked) => {
    setPages((prev) => toggleInList(prev, pageKey, checked));
    if (!checked) {
      const pageButtonKeys = PAGE_PERMISSIONS.find((item) => item.key === pageKey)?.buttons.map((item) => item.key) || [];
      setButtons((prev) => prev.filter((item) => !pageButtonKeys.includes(item)));
    }
  };

  const toggleButton = (buttonKey, pageKey, checked) => {
    setButtons((prev) => toggleInList(prev, buttonKey, checked));
    if (checked) {
      setPages((prev) => toggleInList(prev, pageKey, true));
    }
  };

  const isRowFullySelected = (page) => {
    const pageChecked = pages.includes(page.key);
    const buttonKeys = page.buttons.map((item) => item.key);
    return pageChecked && buttonKeys.every((key) => buttons.includes(key));
  };

  const isRowPartiallySelected = (page) => {
    const pageChecked = pages.includes(page.key);
    const buttonKeys = page.buttons.map((item) => item.key);
    const selectedButtonCount = buttonKeys.filter((key) => buttons.includes(key)).length;
    if (pageChecked && selectedButtonCount === buttonKeys.length && buttonKeys.length > 0) return false;
    return pageChecked || selectedButtonCount > 0;
  };

  const toggleRowAll = (page, checked) => {
    const buttonKeys = page.buttons.map((item) => item.key);
    setPages((prev) => toggleInList(prev, page.key, checked));
    setButtons((prev) => {
      if (checked) return [...new Set([...prev, ...buttonKeys])];
      return prev.filter((item) => !buttonKeys.includes(item));
    });
  };

  const columns = [
    {
      title: '页面',
      dataIndex: 'label',
      width: 140,
      fixed: 'left',
    },
    {
      title: '全选',
      width: 72,
      align: 'center',
      fixed: 'left',
      render: (_, page) => (
        <Checkbox
          checked={isRowFullySelected(page)}
          indeterminate={!isRowFullySelected(page) && isRowPartiallySelected(page)}
          onChange={(checked) => toggleRowAll(page, checked)}
        />
      ),
    },
    {
      title: '可访问',
      width: 88,
      align: 'center',
      render: (_, page) => (
        <Checkbox
          checked={pages.includes(page.key)}
          onChange={(checked) => togglePage(page.key, checked)}
        />
      ),
    },
    ...buttonColumns.map((button) => ({
      title: button.label,
      width: 88,
      align: 'center',
      render: (_, page) => {
        const permissionKey = `${page.key}.${button.key}`;
        const available = page.buttons.some((item) => item.key === permissionKey);
        if (!available) return <Typography.Text type="secondary">—</Typography.Text>;
        return (
          <Checkbox
            checked={buttons.includes(permissionKey)}
            onChange={(checked) => toggleButton(permissionKey, page.key, checked)}
          />
        );
      },
    })),
  ];

  return (
    <Card className="page-card">
      <div className="toolbar">
        <Select
          style={{ width: 320 }}
          placeholder="请选择管理员"
          value={selectedUserId}
          onChange={setSelectedUserId}
          options={admins.map((item) => ({ label: `${item.name || item.phone} (${item.phone || '无手机号'})`, value: item.id }))}
        />
      </div>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        超级管理员拥有全部权限，不在此处配置。当前配置对象：{selectedUser?.name || selectedUser?.phone || '-'}
      </Typography.Text>
      <Spin loading={loading} style={{ width: '100%' }}>
        <Table
          rowKey="key"
          className="permission-table"
          pagination={false}
          border={{ wrapper: true, cell: true }}
          data={PAGE_PERMISSIONS}
          columns={columns}
          scroll={{ x: true }}
        />
      </Spin>
      {selectedUserId && (
        <Button className="floating-save-btn" type="primary" onClick={save}>
          保存
        </Button>
      )}
    </Card>
  );
}
