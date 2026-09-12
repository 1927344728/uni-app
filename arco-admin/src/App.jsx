import {
  IconApps,
  IconBook,
  IconDashboard,
  IconFile,
  IconImage,
  IconList,
  IconMenu,
  IconMusic,
  IconPoweroff,
  IconSafe,
  IconSettings,
  IconStorage,
  IconUser,
  IconVideoCamera,
} from '@arco-design/web-react/icon';
import { Button, Layout, Menu, Result, Spin } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { RESOURCES, ADMIN_ROLE_OPTIONS } from './config/resources';
import { useAuth } from './state/auth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PermissionPage from './pages/PermissionPage';
import ResourcePage from './pages/ResourcePage';
import UserPage from './pages/UserPage';

function adminRoleLabel(adminRole) {
  if (adminRole == null) return '无后台权限';
  return ADMIN_ROLE_OPTIONS.find((item) => item.value === adminRole)?.label || adminRole;
}

const Sider = Layout.Sider;
const Content = Layout.Content;

const iconMap = {
  articles: <IconFile />,
  books: <IconBook />,
  musics: <IconMusic />,
  'music-menus': <IconList />,
  videos: <IconVideoCamera />,
  'video-menus': <IconList />,
  tasks: <IconApps />,
  banners: <IconImage />,
  'home-entries': <IconMenu />,
  categories: <IconStorage />,
  'word-libraries': <IconBook />,
};

function Guard({ children, permission }) {
  const { user, loading, canPage } = useAuth();
  const location = useLocation();

  if (loading) return <Spin className="full-spin" loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (permission && !canPage(permission)) {
    return <Result status="403" title="无权限" subTitle="当前账号没有访问该页面的权限。" />;
  }
  return <>{children}</>;
}

function siderOpenKey(pathname) {
  if (pathname.startsWith('/content')) return 'content';
  if (pathname.startsWith('/ops')) return 'ops';
  if (pathname.startsWith('/system')) return 'system';
  return null;
}

function AdminLayout() {
  const { user, logout, canPage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const contentResources = RESOURCES.filter((item) => item.path.startsWith('/content') && canPage(item.pagePermission));
  const opsResources = RESOURCES.filter((item) => item.path.startsWith('/ops') && canPage(item.pagePermission));
  const [openKeys, setOpenKeys] = useState(() => {
    const key = siderOpenKey(location.pathname);
    return key ? [key] : [];
  });

  useEffect(() => {
    const pageName =
      location.pathname === '/'
        ? '数据看板'
        : location.pathname === '/system/users'
          ? '用户'
          : location.pathname === '/system/permissions'
            ? '权限管理'
            : RESOURCES.find((item) => item.path === location.pathname)?.label || '管理后台';
    document.title = `${pageName}·一兆轻知`;
  }, [location.pathname]);

  useEffect(() => {
    const key = siderOpenKey(location.pathname);
    if (!key) return;
    setOpenKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, [location.pathname]);

  return (
    <Layout className="admin-layout">
      <Sider width={236} className="admin-sider">
        <div className="brand">一兆轻知</div>
        <Menu
          className="admin-sider-menu"
          selectedKeys={[location.pathname]}
          openKeys={openKeys}
          onClickSubMenu={(_, keys) => setOpenKeys(keys)}
          onClickMenuItem={(key) => navigate(key)}
        >
          {canPage('dashboard') && (
            <Menu.Item key="/">
              <IconDashboard /> 数据看板
            </Menu.Item>
          )}
          {contentResources.length > 0 && (
            <Menu.SubMenu key="content" title={<><IconApps /> 内容</>}>
              {contentResources.map((item) => (
                <Menu.Item key={item.path}>{iconMap[item.key]} {item.label}</Menu.Item>
              ))}
            </Menu.SubMenu>
          )}
          {opsResources.length > 0 && (
            <Menu.SubMenu key="ops" title={<><IconSettings /> 运营</>}>
              {opsResources.map((item) => (
                <Menu.Item key={item.path}>{iconMap[item.key]} {item.label}</Menu.Item>
              ))}
            </Menu.SubMenu>
          )}
          {(canPage('system.users') || canPage('system.permissions')) && (
            <Menu.SubMenu key="system" title={<><IconSafe /> 系统</>}>
              {canPage('system.users') && <Menu.Item key="/system/users"><IconUser /> 用户</Menu.Item>}
              {canPage('system.permissions') && <Menu.Item key="/system/permissions"><IconSafe /> 权限管理</Menu.Item>}
            </Menu.SubMenu>
          )}
        </Menu>
        <div className="sider-user">
          <div className="sider-user-meta">
            <div className="sider-user-name">{user?.name || user?.phone || '管理员'}</div>
            <div className="sider-user-role">{adminRoleLabel(user?.adminRole)}</div>
          </div>
          <Button
            type="text"
            status="danger"
            icon={<IconPoweroff />}
            onClick={() => logout().then(() => navigate('/login', { replace: true }))}
          >
            退出
          </Button>
        </div>
      </Sider>
      <Layout>
        <Content className="admin-content">
          <Routes>
            <Route path="/" element={<Guard permission="dashboard"><Dashboard /></Guard>} />
            {RESOURCES.map((item) => (
              <Route
                key={item.key}
                path={item.path}
                element={<Guard permission={item.pagePermission}><ResourcePage config={item} /></Guard>}
              />
            ))}
            <Route path="/system/users" element={<Guard permission="system.users"><UserPage /></Guard>} />
            <Route path="/system/permissions" element={<Guard permission="system.permissions"><PermissionPage /></Guard>} />
            <Route path="*" element={<Result status="404" title="页面不存在" />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<Guard><AdminLayout /></Guard>} />
    </Routes>
  );
}
