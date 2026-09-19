import {
  Button,
  Card,
  Input,
  Message,
  Modal,
  Progress,
  Select,
  Space,
  Table,
  Tooltip,
  Upload,
} from '@arco-design/web-react';
import { IconCopy, IconUpload } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { request } from '../api/http';
import { useAuth } from '../state/auth';

const PAGE_PERMISSION = 'ops.files';
const ENDPOINT = '/api/admin/files';

const FILE_TYPE_OPTIONS = [
  { label: '图片', value: 'image' },
  { label: '音频', value: 'audio' },
  { label: '视频', value: 'video' },
  { label: '其他', value: 'other' },
];

const PREVIEW_MARK = {
  audio: '音',
  video: '视',
  other: '文',
};

function normalizePage(data) {
  if (Array.isArray(data)) {
    return { list: data, total: data.length };
  }
  return { list: data?.content || [], total: Number(data?.totalElements || 0) };
}

/** 毫秒时间戳格式化 */
function formatDateTime(value) {
  if (value == null || value === '') return '-';
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  const ms = num < 1e12 ? num * 1000 : num;
  const parsed = dayjs(ms);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : '-';
}

function formatSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function copyText(text) {
  const value = String(text || '').trim();
  if (!value) {
    Message.warning('无可复制内容');
    return;
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    Message.success('链接已复制');
  } catch {
    Message.error('复制失败，请手动复制');
  }
}

function PreviewThumb({ record, onPreview }) {
  if (record.fileType === 'image' && record.url) {
    return (
      <button type="button" className="file-thumb file-thumb-image" onClick={() => onPreview(record)}>
        <img src={String(record.url)} alt="" />
      </button>
    );
  }
  const mark = PREVIEW_MARK[record.fileType] || PREVIEW_MARK.other;
  return (
    <button
      type="button"
      className={`file-thumb file-thumb-mark is-${record.fileType || 'other'}`}
      onClick={() => onPreview(record)}
      title="点击预览"
    >
      {mark}
    </button>
  );
}

function PreviewContent({ record }) {
  const url = String(record?.url || '');
  if (!url) return <div className="file-preview-body">暂无预览地址</div>;
  if (record.fileType === 'image') {
    return (
      <div className="file-preview-body is-image">
        <img className="file-preview-media" src={url} alt={record.originalName || '预览'} />
      </div>
    );
  }
  if (record.fileType === 'audio') {
    return (
      <div className="file-preview-body is-audio">
        <audio className="file-preview-audio" controls src={url}>
          您的浏览器不支持音频预览
        </audio>
      </div>
    );
  }
  if (record.fileType === 'video') {
    return (
      <div className="file-preview-body is-video">
        <video
          key={url}
          className="file-preview-media"
          controls
          playsInline
          preload="metadata"
          src={url}
        >
          您的浏览器不支持视频预览
        </video>
      </div>
    );
  }
  return (
    <div className="file-preview-body file-preview-fallback">
      <div>该文件类型暂不支持内嵌预览，可复制链接后在浏览器打开。</div>
      <Button type="primary" onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
        新窗口打开
      </Button>
    </div>
  );
}

export default function FilePage() {
  const { canButton } = useAuth();
  const canDelete = canButton(`${PAGE_PERMISSION}.delete`);
  const canUpload = canButton(`${PAGE_PERMISSION}.upload`);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(50);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState();
  const [preview, setPreview] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async (nextPage = page, nextSize = size, nextKeyword = keyword, nextType = type) => {
    setLoading(true);
    try {
      const data = await request(ENDPOINT, {
        params: {
          page: nextPage - 1,
          size: nextSize,
          keyword: nextKeyword,
          type: nextType,
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
      load(1, size, keyword, type).catch(() => undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, type]);

  const remove = (row) => {
    setDeleting(row);
  };

  const confirmDelete = async () => {
    if (!deleting?.id) return;
    setDeleteLoading(true);
    try {
      await request(`${ENDPOINT}/${deleting.id}`, { method: 'DELETE' });
      Message.success('已永久删除');
      const remaining = rows.filter((item) => item.id !== deleting.id);
      const nextPage = remaining.length === 0 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      setDeleting(null);
      await load(nextPage, size, keyword, type);
    } finally {
      setDeleteLoading(false);
    }
  };

  const uploadOne = async (file) => {
    if (file.size > 50 * 1024 * 1024) {
      throw new Error(`${file.name || '文件'}超过 50MB`);
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dir', 'admin/uploads');
    await request(`${ENDPOINT}/upload`, {
      method: 'POST',
      body: formData,
      silent: true,
    });
  };

  const uploadFiles = async (fileList) => {
    const files = (fileList || []).filter(Boolean);
    if (!files.length) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });
    let success = 0;
    const errors = [];
    try {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        try {
          await uploadOne(file);
          success += 1;
        } catch (err) {
          errors.push(err instanceof Error ? err.message : `${file.name || '文件'}上传失败`);
        } finally {
          setUploadProgress({ done: i + 1, total: files.length });
        }
      }
      if (success > 0) {
        Message.success(files.length === 1 ? '上传成功' : `成功上传 ${success}/${files.length} 个文件`);
        setPage(1);
        await load(1, size, keyword, type);
      }
      if (errors.length) {
        Message.error(errors.slice(0, 3).join('；') + (errors.length > 3 ? '…' : ''));
      }
    } finally {
      setUploading(false);
      setUploadProgress({ done: 0, total: 0 });
    }
  };

  const columns = useMemo(() => [
    {
      title: '序号',
      width: 52,
      align: 'center',
      render: (_, __, index) => (page - 1) * size + index + 1,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      width: 56,
      align: 'center',
    },
    {
      title: '预览',
      width: 80,
      align: 'center',
      render: (_, row) => <PreviewThumb record={row} onPreview={setPreview} />,
    },
    {
      title: '文件名',
      dataIndex: 'originalName',
      ellipsis: true,
      render: (value) => value || '-',
    },
    {
      title: 'MIME',
      dataIndex: 'mimeType',
      width: 120,
      ellipsis: true,
      className: 'cell-nowrap',
      render: (value) => value || '-',
    },
    {
      title: '大小',
      dataIndex: 'sizeBytes',
      width: 100,
      align: 'center',
      className: 'cell-nowrap',
      render: (value) => formatSize(value),
    },
    {
      title: '上传时间',
      dataIndex: 'createdTime',
      width: 180,
      align: 'center',
      className: 'cell-nowrap',
      render: (value) => formatDateTime(value),
    },
    {
      title: '操作',
      width: 160,
      align: 'right',
      fixed: 'right',
      render: (_, row) => (
        <div className="table-actions">
          <Space size={8}>
            <Tooltip
              content={
                <span style={{ wordBreak: 'break-all', maxWidth: 420, display: 'inline-block' }}>
                  {row.url || row.objectKey || '暂无路径'}
                </span>
              }
            >
              <Button size="mini" icon={<IconCopy />} onClick={() => copyText(row.url)}>
                复制
              </Button>
            </Tooltip>
            {canDelete && (
              <Button
                size="mini"
                status="danger"
                onClick={(event) => {
                  event.stopPropagation();
                  remove(row);
                }}
              >
                删除
              </Button>
            )}
          </Space>
        </div>
      ),
    },
  ], [page, size, canDelete]);

  return (
    <Card className="page-card">
      {canUpload && (
        <div className="file-upload-panel">
          <Upload
            drag
            multiple
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
            showUploadList={false}
            disabled={uploading}
            beforeUpload={(_, fileList) => {
              // Arco 多选时会对每个文件调一次 beforeUpload；用 fileList 批量处理，并跳过重复触发
              if (fileList?.[0] === _) {
                uploadFiles(fileList).catch(() => undefined);
              }
              return false;
            }}
          >
            <div className="file-upload-drag">
              <IconUpload className="file-upload-drag-icon" />
              <div className="file-upload-drag-title">点击或拖拽文件到此处上传</div>
              <div className="file-upload-drag-desc">支持图片、音频、视频等，可多选，单文件不超过 50MB</div>
            </div>
          </Upload>
          {uploading && uploadProgress.total > 0 && (
            <div className="file-upload-progress">
              <Progress
                percent={Math.round((uploadProgress.done / uploadProgress.total) * 100)}
                formatText={() => `${uploadProgress.done}/${uploadProgress.total}`}
              />
            </div>
          )}
        </div>
      )}
      <div className="toolbar">
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="按文件名搜索"
            autoComplete="off"
            style={{ width: 280 }}
            value={keyword}
            onChange={setKeyword}
          />
          <Select
            allowClear
            placeholder="请选择文件类型"
            style={{ width: 160 }}
            value={type}
            options={FILE_TYPE_OPTIONS}
            onChange={setType}
          />
        </Space>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        data={rows}
        border={{ wrapper: true, cell: true }}
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
      />
      <Modal
        title="确认永久删除？"
        visible={Boolean(deleting)}
        confirmLoading={deleteLoading}
        okText="删除"
        okButtonProps={{ status: 'danger' }}
        onCancel={() => {
          if (!deleteLoading) setDeleting(null);
        }}
        onOk={confirmDelete}
        unmountOnExit
      >
        <div>
          文件删除后不可恢复，确认继续：
          <strong>{deleting?.originalName || deleting?.id}</strong>
        </div>
      </Modal>
      <Modal
        className={`file-preview-modal${preview?.fileType ? ` is-${preview.fileType}` : ''}`}
        title={preview?.originalName || '预览'}
        visible={Boolean(preview)}
        onCancel={() => setPreview(null)}
        focusLock={false}
        footer={
          <Space>
            <Button onClick={() => copyText(preview?.url)}>复制链接</Button>
            <Button
              type="primary"
              onClick={() => preview?.url && window.open(preview.url, '_blank', 'noopener,noreferrer')}
            >
              新窗口打开
            </Button>
          </Space>
        }
        style={{
          width: preview?.fileType === 'video'
            ? Math.min(1280, typeof window !== 'undefined' ? Math.floor(window.innerWidth * 0.94) : 1280)
            : preview?.fileType === 'image'
              ? 900
              : 560,
        }}
        unmountOnExit
      >
        {preview && <PreviewContent record={preview} />}
      </Modal>
    </Card>
  );
}
