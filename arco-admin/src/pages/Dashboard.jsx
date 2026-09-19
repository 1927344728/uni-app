import { Card, Grid, Spin, Table, Typography } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { request } from '../api/http';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setLoading(true);
    request('/api/admin/stats/api-calls')
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const total = rows.reduce((sum, item) => sum + Number(item.total ?? item.totalCount ?? 0), 0);

  return (
    <Spin loading={loading} style={{ width: '100%' }}>
      <Grid.Row gutter={16}>
        <Grid.Col span={8}>
          <Card>
            <Typography.Text type="secondary">接口调用总次数</Typography.Text>
            <div className="metric-number">{total}</div>
          </Card>
        </Grid.Col>
        <Grid.Col span={8}>
          <Card>
            <Typography.Text type="secondary">已统计用户</Typography.Text>
            <div className="metric-number">{rows.length}</div>
          </Card>
        </Grid.Col>
      </Grid.Row>
      <Card className="page-card">
        <Table
          rowKey={(row) => String(row.userId || row.id || row.phone || row.userName || 'anonymous')}
          data={rows}
          pagination={false}
          border={{ wrapper: true, cell: true }}
          expandedRowRender={(row) => (
            <Table
              rowKey="path"
              size="small"
              pagination={false}
              border={{ wrapper: true, cell: true }}
              data={row.calls || []}
              columns={[
                { title: '接口路径', dataIndex: 'path' },
                { title: '次数', dataIndex: 'count', width: 120 },
              ]}
            />
          )}
          columns={[
            { title: '序号', width: 64, align: 'center', render: (_, __, index) => index + 1 },
            { title: '用户', render: (_, row) => row.userName || row.phone || '未登录' },
            { title: '手机号', dataIndex: 'phone', width: 150, align: 'center', ellipsis: true },
            { title: '调用总次数', render: (_, row) => row.total ?? row.totalCount ?? 0, width: 120, align: 'center' },
          ]}
        />
      </Card>
    </Spin>
  );
}
