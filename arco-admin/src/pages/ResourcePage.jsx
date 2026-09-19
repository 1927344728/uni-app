import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  Message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from '@arco-design/web-react';
import { IconImage, IconQuestionCircle, IconUpload } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { request, uploadCos } from '../api/http';
import { CONTENT_CATEGORY_OPTIONS, PLATFORM_OPTIONS } from '../config/resources';
import { buildSubTypeOptions, buildTypeOptions } from '../config/category';
import { useAuth } from '../state/auth';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function toDayjsValue(value) {
  if (value == null || value === '') return undefined;
  if (dayjs.isDayjs(value)) return value.isValid() ? value : undefined;
  const parsed = typeof value === 'number' || /^\d+$/.test(String(value))
    ? dayjs(Number(value))
    : dayjs(value);
  return parsed.isValid() ? parsed : undefined;
}

function formatDateTime(value) {
  const parsed = toDayjsValue(value);
  return parsed ? parsed.format(DATE_TIME_FORMAT) : '-';
}

const COMPACT_KEYS = new Set([
  'id',
  'seq',
  'author',
  'singer',
  'publisher',
  'status',
  'score',
  'categoryId',
  'categoryName',
  'typeId',
  'typeName',
  'subTypeId',
  'subTypeName',
  'progress',
]);

function normalizePage(data) {
  if (Array.isArray(data)) {
    return { list: data, total: data.length };
  }
  return { list: data?.content || [], total: Number(data?.totalElements || 0) };
}

function toPlatformArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(',').filter(Boolean);
}

function isMultiSelect(field) {
  return field.type === 'select' && field.multiple;
}

function toSelectArray(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveSelectLabel(field, raw) {
  const option = (field.options || []).find((item) => String(item.value) === String(raw));
  return option?.label || String(raw ?? '-');
}

function renderValue(field, value) {
  if (field.type === 'platform') {
    const platforms = toPlatformArray(value);
    if (!platforms.length) return <Tag color="green">全部</Tag>;
    return (
      <Space wrap>
        {platforms.map((item) => (
          <Tag key={item}>{PLATFORM_OPTIONS.find((option) => option.value === item)?.label || item}</Tag>
        ))}
      </Space>
    );
  }
  if (field.type === 'select') {
    if (isMultiSelect(field)) {
      const values = toSelectArray(value);
      if (!values.length) return '-';
      return values.map((item) => resolveSelectLabel(field, item)).join('、');
    }
    if (value == null || value === '') return '-';
    return resolveSelectLabel(field, value);
  }
  if (field.type === 'image') {
    if (!value) return '-';
    return <Image width={40} height={40} src={String(value)} style={{ objectFit: 'cover', borderRadius: 6 }} />;
  }
  if (field.type === 'date') {
    return formatDateTime(value);
  }
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value ?? '-');
}

function parseFieldValue(field, value) {
  if (field.type === 'platform' || isMultiSelect(field)) {
    const selected = Array.isArray(value) ? value : [];
    return selected.length ? selected.map(String).join(',') : null;
  }
  if (field.type === 'date') {
    const parsed = toDayjsValue(value);
    return parsed ? parsed.valueOf() : null;
  }
  if (field.type === 'json' && typeof value === 'string' && value.trim()) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value === '' ? null : value;
}

function getFieldInitialValue(field, value) {
  if (field.type === 'platform' || isMultiSelect(field)) return toSelectArray(value);
  if (field.type === 'date') return toDayjsValue(value);
  if (field.type === 'json') {
    if (value === undefined || value === null || value === '') return '';
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  }
  if (field.type === 'textarea' && value != null && typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  if (field.key === 'subType' && (value === 0 || value === '0')) return undefined;
  return value ?? undefined;
}

function getFormValues(fields, record) {
  const values = {};
  fields.forEach((field) => {
    values[field.key] = getFieldInitialValue(field, record?.[field.key]);
  });
  return values;
}

function fillForm(form, fields, record) {
  form.setFieldsValue(getFormValues(fields, record));
}

function getColumnProps(field, compactIds) {
  if (field.width) {
    return { width: field.width, align: 'center' };
  }
  if (field.type === 'image') {
    return { width: 72, align: 'center' };
  }
  if (field.type === 'platform') {
    return { width: 120, align: 'center' };
  }
  if (field.type === 'select' && field.multiple) {
    return { width: 168, ellipsis: true };
  }
  if (field.type === 'date') {
    return { width: 176, align: 'center' };
  }
  if (field.key === 'seq') {
    return { width: 108, align: 'center' };
  }
  if (field.type === 'number' || COMPACT_KEYS.has(field.key) || /Id$/i.test(field.key)) {
    let width = compactIds ? 72 : 100;
    if (['author', 'publisher'].includes(field.key)) {
      width = 120;
    }
    if (['singer'].includes(field.key)) {
      width = 140;
    }
    return {
      width,
      align: 'center',
    };
  }
  return { ellipsis: true };
}

function buildRowSpans(rows, keys) {
  const spans = new Array(rows.length).fill(1);
  let i = 0;
  while (i < rows.length) {
    let count = 1;
    while (
      i + count < rows.length &&
      keys.every((key) => String(rows[i + count]?.[key] ?? '') === String(rows[i]?.[key] ?? ''))
    ) {
      count += 1;
    }
    spans[i] = count;
    for (let j = 1; j < count; j += 1) spans[i + j] = 0;
    i += count;
  }
  return spans;
}

function withRowSpan(children, rowSpan) {
  if (rowSpan == null) return children;
  return {
    children,
    props: { rowSpan },
  };
}

function getTypeFilter(config, fields) {
  if (config.key === 'categories') {
    return { key: 'type', label: '类型', options: CONTENT_CATEGORY_OPTIONS };
  }
  const typeField = fields.find((field) => field.key === 'type' && field.options?.length);
  if (!typeField) return null;
  return { key: 'type', label: typeField.label || '类型', options: typeField.options };
}

function SeqCellInput({ value, disabled, saving, onCommit }) {
  const [draft, setDraft] = useState(value ?? undefined);

  useEffect(() => {
    setDraft(value ?? undefined);
  }, [value]);

  const commit = async () => {
    const next = draft === '' || draft == null ? null : Number(draft);
    const prev = value === '' || value == null ? null : Number(value);
    if (next === prev) return;
    if (next != null && Number.isNaN(next)) {
      setDraft(value ?? undefined);
      return;
    }
    try {
      await onCommit?.(next);
    } catch {
      setDraft(value ?? undefined);
    }
  };

  return (
    <InputNumber
      className="seq-cell-input"
      size="mini"
      hideControl
      value={draft}
      disabled={disabled || saving}
      onChange={setDraft}
      onBlur={commit}
      onPressEnter={commit}
    />
  );
}

function FieldLabel({ field }) {
  if (field.type !== 'json' || (!field.tip && !field.example)) {
    return field.label;
  }
  return (
    <span className="field-label-with-tip">
      <span>{field.label}</span>
      <Tooltip
        position="top"
        content={
          <div className="field-tip-content">
            {field.tip && <div className="field-tip-text">{field.tip}</div>}
            {field.example && (
              <>
                <div className="field-tip-example-title">示例</div>
                <pre className="field-tip-example">{field.example}</pre>
              </>
            )}
          </div>
        }
      >
        <span className="field-tip-icon-wrap">
          <IconQuestionCircle className="field-tip-icon" />
        </span>
      </Tooltip>
    </span>
  );
}

function openPreviewLink(raw) {
  const url = String(raw || '').trim();
  if (!url) {
    Message.warning('请先填写链接');
    return;
  }
  const href = /^https?:\/\//i.test(url) || url.startsWith('/') ? url : `https://${url}`;
  window.open(href, '_blank', 'noopener,noreferrer');
}

function LinkFieldInput({ value, onChange, placeholder, ...rest }) {
  return (
    <div className="link-field">
      <Input
        allowClear
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        onChange={onChange}
        {...rest}
      />
      <Button type="secondary" onClick={() => openPreviewLink(value)}>
        预览
      </Button>
    </div>
  );
}

function ImageFieldInput({ value, onChange, canUpload, onUpload, uploading, placeholder, ...rest }) {
  const fileRef = useRef(null);
  const [broken, setBroken] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const hasImage = Boolean(value) && !broken;

  useEffect(() => {
    setBroken(false);
  }, [value]);

  const openPicker = () => {
    if (!canUpload || uploading) return;
    fileRef.current?.click();
  };

  return (
    <div className="image-field">
      <Input
        allowClear
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        disabled={uploading}
        onChange={(next) => {
          setBroken(false);
          onChange?.(next);
        }}
        {...rest}
      />
      <div
        className={`image-field-preview${canUpload && !uploading ? ' is-clickable' : ''}${hasImage ? '' : ' is-empty'}${uploading ? ' is-uploading' : ''}`}
        onClick={openPicker}
        role={canUpload ? 'button' : undefined}
        tabIndex={canUpload && !uploading ? 0 : undefined}
        onKeyDown={(event) => {
          if (!canUpload || uploading) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
          }
        }}
      >
        {hasImage ? (
          <img src={String(value)} alt="预览" onError={() => setBroken(true)} />
        ) : (
          <div className="image-field-placeholder">
            <IconImage />
            <span>{canUpload ? '点击上传图片' : '暂无图片'}</span>
            {canUpload && <IconUpload className="image-field-upload-icon" />}
          </div>
        )}
        {hasImage && !uploading && (
          <Button
            className="image-field-preview-btn"
            size="mini"
            type="secondary"
            onClick={(event) => {
              event.stopPropagation();
              setPreviewVisible(true);
            }}
          >
            预览
          </Button>
        )}
        {hasImage && canUpload && !uploading && (
          <div className="image-field-mask">
            <IconUpload />
            <span>点击替换</span>
          </div>
        )}
        {uploading && (
          <div className="image-field-loading">
            <Spin />
            <span>上传中...</span>
          </div>
        )}
      </div>
      {hasImage && (
        <Image.Preview
          src={String(value)}
          visible={previewVisible}
          onVisibleChange={setPreviewVisible}
        />
      )}
      {canUpload && (
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          autoComplete="off"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) onUpload?.(file);
          }}
        />
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange, canUpload, onUpload, uploading, ...rest }) {
  const placeholder = field.placeholder || `请输入${field.label}`;
  if (field.type === 'number') {
    return <InputNumber style={{ width: '100%' }} placeholder={placeholder} value={value} onChange={onChange} {...rest} />;
  }
  if (field.type === 'textarea') {
    return (
      <Input.TextArea
        autoSize={{ minRows: field.key === 'words' ? 8 : 3, maxRows: field.key === 'words' ? 24 : 8 }}
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        onChange={onChange}
        {...rest}
      />
    );
  }
  if (field.type === 'json') {
    return (
      <Input.TextArea
        autoSize={{ minRows: 6, maxRows: 16 }}
        placeholder="请输入 JSON；未知结构会原样保存"
        autoComplete="off"
        value={value}
        onChange={onChange}
        {...rest}
      />
    );
  }
  if (field.type === 'platform') {
    return (
      <Select
        mode="multiple"
        options={PLATFORM_OPTIONS}
        placeholder="请选择平台"
        allowClear
        value={value}
        onChange={onChange}
        {...rest}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <Select
        mode={field.multiple ? 'multiple' : undefined}
        options={field.options || []}
        allowClear
        showSearch
        placeholder={`请选择${field.label}`}
        value={value}
        onChange={onChange}
        {...rest}
      />
    );
  }
  if (field.type === 'link') {
    return <LinkFieldInput value={value} onChange={onChange} placeholder={placeholder} {...rest} />;
  }
  if (field.type === 'image') {
    return (
      <ImageFieldInput
        value={value}
        onChange={onChange}
        canUpload={canUpload}
        onUpload={onUpload}
        uploading={uploading}
        placeholder={placeholder}
        {...rest}
      />
    );
  }
  if (field.type === 'date') {
    return (
      <DatePicker
        showTime
        style={{ width: '100%' }}
        allowClear
        format={DATE_TIME_FORMAT}
        placeholder={`请选择${field.label}`}
        value={value}
        onChange={(_, date) => onChange?.(date)}
        {...rest}
      />
    );
  }
  return <Input allowClear placeholder={placeholder} autoComplete="off" value={value} onChange={onChange} {...rest} />;
}

export default function ResourcePage({ config }) {
  const [form] = Form.useForm();
  const { canButton } = useAuth();
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(50);
  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState();
  const [type, setType] = useState();
  const [editing, setEditing] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create');
  const [formKey, setFormKey] = useState(0);
  const [uploadingField, setUploadingField] = useState(null);
  const [savingSeqId, setSavingSeqId] = useState(null);
  const selectedTypes = Form.useWatch('type', form);
  const selectedCategoryId = Form.useWatch('categoryId', form);

  const pagePermission = config.pagePermission;
  const can = (action) => canButton(`${pagePermission}.${action}`);
  const needsCategoryOptions = useMemo(
    () => config.fields.some((field) => field.categoryId != null),
    [config.fields],
  );

  const resolvedFields = useMemo(() => {
    if (!needsCategoryOptions) return config.fields;
    return config.fields.map((field) => {
      if (field.categoryId == null) return field;
      if (field.categoryLevel === 'subType') {
        return {
          ...field,
          options: buildSubTypeOptions(field.categoryId, selectedTypes),
        };
      }
      return {
        ...field,
        options: field.options?.length ? field.options : buildTypeOptions(field.categoryId),
      };
    });
  }, [config.fields, needsCategoryOptions, selectedTypes]);

  const typeFilter = useMemo(() => getTypeFilter(config, resolvedFields), [config, resolvedFields]);
  const compactIds = Boolean(config.compactIds);

  const load = async (nextPage = page, nextSize = size, nextKeyword = keyword, nextPlatform = platform, nextType = type) => {
    setLoading(true);
    try {
      const data = await request(config.endpoint, {
        params: {
          page: nextPage - 1,
          size: nextSize,
          keyword: nextKeyword,
          platform: nextPlatform,
          type: typeFilter ? nextType : undefined,
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
    setType(undefined);
  }, [config.endpoint]);

  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      load(1, size, keyword, platform, type).catch(() => undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [config.endpoint, keyword, platform, type]);

  useEffect(() => {
    if (!drawerVisible || detailLoading) return;
    if (drawerMode === 'edit' && editing) {
      fillForm(form, config.fields, editing);
    } else if (drawerMode === 'create') {
      form.resetFields();
      form.clearFields();
    }
  }, [drawerVisible, drawerMode, editing, detailLoading, config.fields, form, formKey]);

  useEffect(() => {
    if (!drawerVisible) return;
    const subTypeField = resolvedFields.find((field) => field.categoryLevel === 'subType');
    if (!subTypeField) return;
    const current = form.getFieldValue('subType');
    if (current == null || current === '') return;
    const stillValid = (subTypeField.options || []).some((option) => String(option.value) === String(current));
    if (!stillValid) form.setFieldValue('subType', undefined);
  }, [drawerVisible, form, resolvedFields, selectedTypes]);

  useEffect(() => {
    if (!drawerVisible || config.key !== 'categories') return;
    const option = CONTENT_CATEGORY_OPTIONS.find((item) => String(item.value) === String(selectedCategoryId));
    if (!option) return;
    const currentName = form.getFieldValue('categoryName');
    const isKnownName = !currentName || CONTENT_CATEGORY_OPTIONS.some((item) => item.label === currentName);
    if (isKnownName && currentName !== option.label) {
      form.setFieldValue('categoryName', option.label);
    }
  }, [drawerVisible, config.key, selectedCategoryId, form]);

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
      const detail = await request(`${config.endpoint}/${row.id}`);
      setEditing(detail);
    } catch {
      setDrawerVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const save = async () => {
    const values = await form.validate();
    const body = {};
    resolvedFields.forEach((field) => {
      body[field.key] = parseFieldValue(field, values[field.key]);
    });
    const id = editing?.id;
    await request(id ? `${config.endpoint}/${id}` : config.endpoint, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    });
    Message.success('保存成功');
    setDrawerVisible(false);
    load().catch(() => undefined);
  };

  const remove = (row) => {
    Modal.confirm({
      title: '确认删除？',
      content: `删除后客户端将不可见：${row.title || row.name || row.id}`,
      onOk: async () => {
        await request(`${config.endpoint}/${row.id}`, { method: 'DELETE' });
        Message.success('已删除');
        load().catch(() => undefined);
      },
    });
  };

  const restore = async (row) => {
    const detail = await request(`${config.endpoint}/${row.id}`);
    await request(`${config.endpoint}/${row.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...detail, isDeleted: false }),
    });
    Message.success('已恢复');
    load().catch(() => undefined);
  };

  const saveSeq = async (row, seq) => {
    setSavingSeqId(row.id);
    try {
      await request(`${config.endpoint}/${row.id}`, {
        method: 'PUT',
        body: JSON.stringify({ seq }),
      });
      Message.success('排序已更新');
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, seq } : item)));
      load().catch(() => undefined);
    } finally {
      setSavingSeqId(null);
    }
  };

  const uploadForField = async (field, file) => {
    setUploadingField(field.key);
    try {
      const data = await uploadCos(file, field.type === 'media' ? 'admin/media' : 'admin/images');
      const url = data.url || data.publicUrl || data.key;
      if (!url) throw new Error('上传接口未返回 URL');
      form.setFieldValue(field.key, url);
      Message.success('上传成功');
    } catch (err) {
      Message.error(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploadingField(null);
    }
  };

  const mergeSpans = useMemo(() => {
    const mergeCells = config.mergeCells;
    if (!mergeCells || !rows.length) return {};
    const result = {};
    Object.entries(mergeCells).forEach(([column, keys]) => {
      result[column] = buildRowSpans(rows, keys);
    });
    return result;
  }, [config.mergeCells, rows]);

  const columns = useMemo(() => {
    const fieldColumns = resolvedFields
      .filter((field) => field.table)
      .map((field) => ({
        title: field.label,
        dataIndex: field.key,
        ...getColumnProps(field, compactIds),
        render: (value, row, index) => {
          let children = renderValue(field, value);
          if (field.key === 'seq') {
            children = (
              <SeqCellInput
                value={value}
                disabled={!can('edit')}
                saving={savingSeqId === row.id}
                onCommit={(next) => saveSeq(row, next)}
              />
            );
          }
          return withRowSpan(children, mergeSpans[field.key]?.[index]);
        },
      }));
    return [
      {
        title: '序号',
        width: compactIds ? 48 : 64,
        align: 'center',
        render: (_, __, index) => (page - 1) * size + index + 1,
      },
      {
        title: 'ID',
        dataIndex: 'id',
        width: compactIds ? 56 : 72,
        align: 'center',
      },
      ...fieldColumns,
      {
        title: '状态',
        dataIndex: 'isDeleted',
        width: compactIds ? 72 : 88,
        align: 'center',
        render: (value) => (value ? <Tag color="red">已删除</Tag> : <Tag color="green">正常</Tag>),
      },
      {
        title: '操作',
        width: compactIds ? 120 : 148,
        align: 'right',
        fixed: 'right',
        render: (_, row) => (
          <div className="table-actions">
            <Space size={8}>
              {can('edit') && (
                <Button size="mini" onClick={() => openEdit(row)}>
                  编辑
                </Button>
              )}
              {!row.isDeleted && can('delete') && (
                <Button size="mini" status="danger" onClick={() => remove(row)}>
                  删除
                </Button>
              )}
              {row.isDeleted && can('restore') && (
                <Button size="mini" status="success" onClick={() => restore(row)}>
                  恢复
                </Button>
              )}
            </Space>
          </div>
        ),
      },
    ];
  }, [resolvedFields, pagePermission, page, size, savingSeqId, compactIds, mergeSpans]);

  return (
    <Card className="page-card">
      <div className="toolbar">
        <Space wrap>
          {config.searchable && (
            <Input.Search
              allowClear
              placeholder="请输入关键词搜索"
              autoComplete="off"
              style={{ width: 260 }}
              value={keyword}
              onChange={setKeyword}
            />
          )}
          {typeFilter && (
            <Select
              allowClear
              placeholder={`请选择${typeFilter.label}`}
              style={{ width: 180 }}
              value={type}
              options={typeFilter.options}
              onChange={setType}
            />
          )}
          <Select
            allowClear
            placeholder="请选择平台"
            style={{ width: 180 }}
            value={platform}
            options={PLATFORM_OPTIONS}
            onChange={(value) => setPlatform(value === 'all' || value == null ? undefined : value)}
          />
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
      <Drawer
        width={720}
        title={drawerMode === 'edit' ? `编辑${config.label}` : `新建${config.label}`}
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
              initialValues={drawerMode === 'edit' ? getFormValues(config.fields, editing) : undefined}
            >
              {resolvedFields.map((field) => (
                <Form.Item
                  key={field.key}
                  field={field.key}
                  label={<FieldLabel field={field} />}
                  rules={
                    field.required
                      ? [{
                          required: true,
                          message: field.type === 'select' || field.type === 'platform' || field.type === 'date'
                            ? `请选择${field.label}`
                            : `请输入${field.label}`,
                        }]
                      : undefined
                  }
                  extra={
                    field.type === 'media' && can('upload') ? (
                      <input
                        type="file"
                        accept="audio/*,video/*"
                        autoComplete="off"
                        onChange={(event) => event.target.files?.[0] && uploadForField(field, event.target.files[0])}
                      />
                    ) : undefined
                  }
                >
                  <FieldInput
                    field={field}
                    canUpload={can('upload')}
                    uploading={uploadingField === field.key}
                    onUpload={(file) => uploadForField(field, file)}
                  />
                </Form.Item>
              ))}
            </Form>
          )}
        </Spin>
      </Drawer>
    </Card>
  );
}
