package com.lizhao.yizhao.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lizhao.yizhao.dto.response.CommonResponse;
import com.lizhao.yizhao.entity.*;
import com.lizhao.yizhao.repository.*;
import com.lizhao.yizhao.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Method;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private record ResourceDef(JpaRepository repository, Class<?> entityClass) {}

  private final UserRepository userRepository;
  private final AdminPermissionRepository adminPermissionRepository;
  private final ApiCallStatRepository apiCallStatRepository;
  private final JwtUtil jwtUtil;
  private final ObjectMapper objectMapper;
  private final Map<String, ResourceDef> resources;

  public AdminController(
      UserRepository userRepository,
      AdminPermissionRepository adminPermissionRepository,
      ApiCallStatRepository apiCallStatRepository,
      ArticleRepository articleRepository,
      BookRepository bookRepository,
      MusicRepository musicRepository,
      MusicMenuRepository musicMenuRepository,
      VideoRepository videoRepository,
      VideoMenuRepository videoMenuRepository,
      TaskRepository taskRepository,
      BannerRepository bannerRepository,
      HomeEntryRepository homeEntryRepository,
      CategoryRepository categoryRepository,
      WordLibraryRepository wordLibraryRepository,
      JwtUtil jwtUtil,
      ObjectMapper objectMapper) {
    this.userRepository = userRepository;
    this.adminPermissionRepository = adminPermissionRepository;
    this.apiCallStatRepository = apiCallStatRepository;
    this.jwtUtil = jwtUtil;
    this.objectMapper = objectMapper;
    this.resources = Map.ofEntries(
        Map.entry("articles", new ResourceDef(articleRepository, ArticleEntity.class)),
        Map.entry("books", new ResourceDef(bookRepository, BookEntity.class)),
        Map.entry("musics", new ResourceDef(musicRepository, MusicEntity.class)),
        Map.entry("music-menus", new ResourceDef(musicMenuRepository, MusicMenuEntity.class)),
        Map.entry("videos", new ResourceDef(videoRepository, VideoEntity.class)),
        Map.entry("video-menus", new ResourceDef(videoMenuRepository, VideoMenuEntity.class)),
        Map.entry("tasks", new ResourceDef(taskRepository, TaskEntity.class)),
        Map.entry("banners", new ResourceDef(bannerRepository, BannerEntity.class)),
        Map.entry("home-entries", new ResourceDef(homeEntryRepository, HomeEntryEntity.class)),
        Map.entry("categories", new ResourceDef(categoryRepository, CategoryEntity.class)),
        Map.entry("word-libraries", new ResourceDef(wordLibraryRepository, WordLibraryEntity.class))
    );
  }

  @PostMapping("/login")
  public ResponseEntity<CommonResponse<Map<String, Object>>> login(@RequestBody Map<String, Object> body) {
    String phone = stringValue(firstPresent(body, "phone", "account", "username"));
    String password = stringValue(body.get("password"));
    if (phone == null || !phone.matches("^1\\d{10}$")) {
      return fail(HttpStatus.BAD_REQUEST, "请输入 11 位手机号");
    }
    Optional<UserEntity> user = userRepository.findByPhone(phone);
    if (user.isEmpty() || !Objects.equals(user.get().getPassword(), password)) {
      return fail(HttpStatus.FORBIDDEN, "手机号或密码错误");
    }
    if (Boolean.TRUE.equals(user.get().getIsDeleted()) || !isAdmin(user.get())) {
      return fail(HttpStatus.FORBIDDEN, "该账号不能登录管理后台");
    }

    String token = jwtUtil.generateAdminToken(user.get().getPhone());
    return ok(adminSession(user.get(), token));
  }

  @PostMapping("/logout")
  public CommonResponse<String> logout() {
    return CommonResponse.success("登出成功");
  }

  @GetMapping("/me")
  public ResponseEntity<CommonResponse<Map<String, Object>>> me(HttpServletRequest request) {
    Optional<UserEntity> user = currentAdmin(request);
    return user.map(value -> ok(adminSession(value, null)))
        .orElseGet(() -> fail(HttpStatus.UNAUTHORIZED, "请登录"));
  }

  @GetMapping("/stats/api-calls")
  public CommonResponse<List<Map<String, Object>>> apiCallStats() {
    Map<String, Map<String, Object>> grouped = new LinkedHashMap<>();
    for (ApiCallStatEntity stat : apiCallStatRepository.findAll()) {
      String groupKey = stat.getUserId() == null ? "anonymous" : String.valueOf(stat.getUserId());
      Map<String, Object> row = grouped.computeIfAbsent(groupKey, key -> {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("userId", stat.getUserId());
        item.put("userName", stat.getUserName());
        item.put("phone", stat.getPhone());
        item.put("totalCount", 0L);
        item.put("calls", new ArrayList<Map<String, Object>>());
        return item;
      });
      long count = stat.getCount() == null ? 0L : stat.getCount();
      row.put("totalCount", ((Long) row.get("totalCount")) + count);
      @SuppressWarnings("unchecked")
      List<Map<String, Object>> calls = (List<Map<String, Object>>) row.get("calls");
      calls.add(Map.of("path", stat.getPath(), "count", count));
    }

    List<Map<String, Object>> rows = new ArrayList<>(grouped.values());
    rows.sort((left, right) -> Long.compare((Long) right.get("totalCount"), (Long) left.get("totalCount")));
    rows.forEach(row -> {
      @SuppressWarnings("unchecked")
      List<Map<String, Object>> calls = (List<Map<String, Object>>) row.get("calls");
      calls.sort((left, right) -> Long.compare((Long) right.get("count"), (Long) left.get("count")));
    });
    return CommonResponse.success(rows);
  }

  @GetMapping("/users")
  public CommonResponse<Page<UserEntity>> users(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) Integer role,
      @RequestParam(required = false) Integer adminRole,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(required = false) Integer pageNum,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(required = false) Integer pageSize) {
    int currentPage = pageNum != null ? pageNum : page;
    int currentSize = pageSize != null ? pageSize : size;
    List<UserEntity> filtered = userRepository.findAll().stream()
        .filter(item -> role == null || Objects.equals(item.getRole(), role))
        .filter(item -> adminRole == null || Objects.equals(item.getAdminRole(), adminRole))
        .filter(item -> isBlank(keyword)
            || contains(item.getPhone(), keyword)
            || contains(item.getName(), keyword)
            || contains(item.getNickname(), keyword)
            || contains(item.getAlias(), keyword))
        .sorted(this::compareListOrder)
        .toList();
    return CommonResponse.success(pageList(filtered, currentPage, currentSize));
  }

  @GetMapping("/users/{id}")
  public ResponseEntity<CommonResponse<UserEntity>> getUser(@PathVariable Long id) {
    Optional<UserEntity> target = userRepository.findById(id);
    if (target.isEmpty()) return fail(HttpStatus.NOT_FOUND, "用户不存在");
    return ok(target.get());
  }

  @PostMapping("/users")
  public ResponseEntity<CommonResponse<UserEntity>> createUser(@RequestBody Map<String, Object> body, HttpServletRequest request) {
    Optional<UserEntity> current = currentAdmin(request);
    if (current.isEmpty()) return fail(HttpStatus.UNAUTHORIZED, "请登录");
    Integer role = intValue(body.getOrDefault("role", 2));
    if (!isClientRole(role)) {
      return fail(HttpStatus.BAD_REQUEST, "客户端角色仅支持超级管理员(1)/家长(2)/学生(3)");
    }
    Integer adminRole = body.containsKey("adminRole") ? intValue(body.get("adminRole")) : null;
    if (!isValidAdminRole(adminRole)) {
      return fail(HttpStatus.BAD_REQUEST, "后台角色仅支持空/超级管理员(1)/管理员(2)");
    }
    if (adminRole != null && !isSuperAdmin(current.get())) {
      return fail(HttpStatus.FORBIDDEN, "只有超级管理员可创建管理员账号");
    }
    String phone = stringValue(body.get("phone"));
    if (phone == null || !phone.matches("^1\\d{10}$")) {
      return fail(HttpStatus.BAD_REQUEST, "手机号必须为 11 位");
    }
    if (userRepository.findByPhone(phone).isPresent()) {
      return fail(HttpStatus.BAD_REQUEST, "手机号已存在");
    }

    UserEntity user = new UserEntity();
    try {
      objectMapper.updateValue(user, body);
    } catch (Exception e) {
      return fail(HttpStatus.BAD_REQUEST, "用户字段格式错误");
    }
    user.setUuid(UUID.randomUUID().toString());
    user.setPhone(phone);
    user.setRole(role);
    user.setAdminRole(adminRole);
    if (isBlank(user.getAlias())) user.setAlias("");
    if (isBlank(user.getPassword())) user.setPassword("123456");
    user.setIsDeleted(false);
    user.setCreatedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());
    return ok(userRepository.save(user));
  }

  @PutMapping("/users/{id}")
  public ResponseEntity<CommonResponse<UserEntity>> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> body, HttpServletRequest request) {
    Optional<UserEntity> current = currentAdmin(request);
    Optional<UserEntity> target = userRepository.findById(id);
    if (current.isEmpty()) return fail(HttpStatus.UNAUTHORIZED, "请登录");
    if (target.isEmpty()) return fail(HttpStatus.NOT_FOUND, "用户不存在");

    Integer nextRole = body.containsKey("role") ? intValue(body.get("role")) : target.get().getRole();
    if (body.containsKey("role") && !isClientRole(nextRole)) {
      return fail(HttpStatus.BAD_REQUEST, "客户端角色仅支持超级管理员(1)/家长(2)/学生(3)");
    }

    boolean touchingAdminRole = body.containsKey("adminRole");
    Integer nextAdminRole = touchingAdminRole ? intValue(body.get("adminRole")) : target.get().getAdminRole();
    if (touchingAdminRole && !isValidAdminRole(nextAdminRole)) {
      return fail(HttpStatus.BAD_REQUEST, "后台角色仅支持空/超级管理员(1)/管理员(2)");
    }
    if (touchingAdminRole && !Objects.equals(nextAdminRole, target.get().getAdminRole())) {
      if (!isSuperAdmin(current.get())) return fail(HttpStatus.FORBIDDEN, "只有超级管理员可修改后台角色");
      if (Objects.equals(current.get().getId(), id)) return fail(HttpStatus.FORBIDDEN, "不可降权当前登录的自己");
      if (isSuperAdmin(target.get()) && !Objects.equals(nextAdminRole, 1)
          && userRepository.countByAdminRoleAndIsDeletedFalse(1) <= 1) {
        return fail(HttpStatus.FORBIDDEN, "至少保留一名超级管理员");
      }
    }
    try {
      objectMapper.updateValue(target.get(), body);
    } catch (Exception e) {
      return fail(HttpStatus.BAD_REQUEST, "用户字段格式错误");
    }
    if (touchingAdminRole) {
      target.get().setAdminRole(nextAdminRole);
    }
    target.get().setUpdatedAt(LocalDateTime.now());
    return ok(userRepository.save(target.get()));
  }

  @DeleteMapping("/users/{id}")
  public ResponseEntity<CommonResponse<String>> deleteUser(@PathVariable Long id, HttpServletRequest request) {
    Optional<UserEntity> current = currentAdmin(request);
    Optional<UserEntity> target = userRepository.findById(id);
    if (current.isEmpty()) return fail(HttpStatus.UNAUTHORIZED, "请登录");
    if (target.isEmpty()) return fail(HttpStatus.NOT_FOUND, "用户不存在");
    if (Objects.equals(current.get().getId(), id)) return fail(HttpStatus.FORBIDDEN, "不可删除当前登录的自己");
    if (isSuperAdmin(target.get()) && userRepository.countByAdminRoleAndIsDeletedFalse(1) <= 1) {
      return fail(HttpStatus.FORBIDDEN, "至少保留一名超级管理员");
    }
    target.get().setIsDeleted(true);
    target.get().setUpdatedAt(LocalDateTime.now());
    userRepository.save(target.get());
    return ok("已删除");
  }

  @PutMapping("/users/{id}/password")
  public ResponseEntity<CommonResponse<String>> resetPassword(@PathVariable Long id, @RequestBody Map<String, Object> body) {
    String password = stringValue(body.get("password"));
    if (isBlank(password)) return fail(HttpStatus.BAD_REQUEST, "密码不能为空");
    if (userRepository.findById(id).isEmpty()) return fail(HttpStatus.NOT_FOUND, "用户不存在");
    userRepository.updatePasswordById(id, password);
    return ok("密码已重置");
  }

  @GetMapping("/users/{id}/permissions")
  public CommonResponse<Map<String, Object>> getPermissions(@PathVariable Long id) {
    return CommonResponse.success(permissionPayload(id));
  }

  @PutMapping("/users/{id}/permissions")
  public ResponseEntity<CommonResponse<Map<String, Object>>> savePermissions(@PathVariable Long id, @RequestBody Map<String, Object> body, HttpServletRequest request) throws JsonProcessingException {
    Optional<UserEntity> current = currentAdmin(request);
    if (current.isEmpty()) return fail(HttpStatus.UNAUTHORIZED, "请登录");
    if (!isSuperAdmin(current.get())) return fail(HttpStatus.FORBIDDEN, "只有超级管理员可配置权限");
    if (userRepository.findById(id).isEmpty()) return fail(HttpStatus.NOT_FOUND, "用户不存在");

    AdminPermissionEntity permission = adminPermissionRepository.findByUserId(id).orElseGet(AdminPermissionEntity::new);
    permission.setUserId(id);
    permission.setPagePermissions(objectMapper.writeValueAsString(listValue(body.get("pages"))));
    permission.setButtonPermissions(objectMapper.writeValueAsString(listValue(body.get("buttons"))));
    adminPermissionRepository.save(permission);
    return ok(permissionPayload(id));
  }

  @GetMapping("/{resource}")
  public ResponseEntity<CommonResponse<Page<Object>>> list(
      @PathVariable String resource,
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String platform,
      @RequestParam(required = false) String type,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(required = false) Integer pageNum,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(required = false) Integer pageSize) {
    ResourceDef def = resources.get(resource);
    if (def == null) return fail(HttpStatus.NOT_FOUND, "资源不存在");
    int currentPage = pageNum != null ? pageNum : page;
    int currentSize = pageSize != null ? pageSize : size;
    List<Object> filtered = ((List<?>) def.repository().findAll()).stream()
        .filter(item -> keywordMatch(item, keyword))
        .filter(item -> adminPlatformMatch(item, platform))
        .filter(item -> adminTypeMatch(item, type))
        .sorted(this::compareListOrder)
        .map(item -> (Object) item)
        .toList();
    return ok(pageList(filtered, currentPage, currentSize));
  }

  @GetMapping("/{resource}/{id}")
  public ResponseEntity<CommonResponse<Object>> detail(@PathVariable String resource, @PathVariable String id) {
    ResourceDef def = resources.get(resource);
    if (def == null) return fail(HttpStatus.NOT_FOUND, "资源不存在");
    Optional<?> entity = def.repository().findById(convertId(def.entityClass(), id));
    if (entity.isEmpty()) return fail(HttpStatus.NOT_FOUND, "记录不存在");
    return ok(entity.get());
  }

  @PostMapping("/{resource}")
  public ResponseEntity<CommonResponse<Object>> create(@PathVariable String resource, @RequestBody Map<String, Object> body) {
    ResourceDef def = resources.get(resource);
    if (def == null) return fail(HttpStatus.NOT_FOUND, "资源不存在");
    stringifyJsonValues(body);
    Object entity = objectMapper.convertValue(body, def.entityClass());
    setIfPresent(entity, "setIsDeleted", Boolean.class, false);
    touchCreate(entity);
    return ok(def.repository().save(entity));
  }

  @PutMapping("/{resource}/{id}")
  public ResponseEntity<CommonResponse<Object>> update(@PathVariable String resource, @PathVariable String id, @RequestBody Map<String, Object> body) {
    ResourceDef def = resources.get(resource);
    if (def == null) return fail(HttpStatus.NOT_FOUND, "资源不存在");
    Optional<?> entity = def.repository().findById(convertId(def.entityClass(), id));
    if (entity.isEmpty()) return fail(HttpStatus.NOT_FOUND, "记录不存在");
    stringifyJsonValues(body);
    try {
      objectMapper.updateValue(entity.get(), body);
    } catch (Exception e) {
      return fail(HttpStatus.BAD_REQUEST, "记录字段格式错误");
    }
    touchUpdate(entity.get());
    return ok(def.repository().save(entity.get()));
  }

  @DeleteMapping("/{resource}/{id}")
  public ResponseEntity<CommonResponse<String>> delete(@PathVariable String resource, @PathVariable String id) {
    ResourceDef def = resources.get(resource);
    if (def == null) return fail(HttpStatus.NOT_FOUND, "资源不存在");
    Optional<?> entity = def.repository().findById(convertId(def.entityClass(), id));
    if (entity.isEmpty()) return fail(HttpStatus.NOT_FOUND, "记录不存在");
    setIfPresent(entity.get(), "setIsDeleted", Boolean.class, true);
    touchUpdate(entity.get());
    def.repository().save(entity.get());
    return ok("已删除");
  }

  private Map<String, Object> adminSession(UserEntity user, String token) {
    Map<String, Object> result = new LinkedHashMap<>();
    if (token != null) result.put("token", token);
    result.put("user", user);
    Map<String, Object> permissions = permissionPayload(user.getId());
    result.put("pages", permissions.get("pages"));
    result.put("buttons", permissions.get("buttons"));
    result.put("permissions", permissions);
    return result;
  }

  private Map<String, Object> permissionPayload(Long userId) {
    Optional<UserEntity> user = userRepository.findById(userId);
    if (user.isPresent() && isSuperAdmin(user.get())) {
      return Map.of("pages", List.of("*"), "buttons", List.of("*"));
    }
    Optional<AdminPermissionEntity> permission = adminPermissionRepository.findByUserId(userId);
    return Map.of(
        "pages", permission.map(item -> readStringList(item.getPagePermissions())).orElseGet(List::of),
        "buttons", permission.map(item -> readStringList(item.getButtonPermissions())).orElseGet(List::of)
    );
  }

  private Optional<UserEntity> currentAdmin(HttpServletRequest request) {
    String authorization = request.getHeader("Authorization");
    if (authorization == null || !authorization.startsWith("Bearer ")) return Optional.empty();
    Claims claims = jwtUtil.parseToken(authorization.substring(7));
    return userRepository.findByPhone(claims.getSubject())
        .filter(user -> !Boolean.TRUE.equals(user.getIsDeleted()) && isAdmin(user));
  }

  private boolean isAdmin(UserEntity user) {
    Integer adminRole = user.getAdminRole();
    return adminRole != null && (adminRole == 1 || adminRole == 2);
  }

  private boolean isSuperAdmin(UserEntity user) {
    return user.getAdminRole() != null && user.getAdminRole() == 1;
  }

  private boolean isClientRole(Integer role) {
    return role != null && (role == 1 || role == 2 || role == 3);
  }

  private boolean isValidAdminRole(Integer adminRole) {
    return adminRole == null || adminRole == 1 || adminRole == 2;
  }

  private List<String> readStringList(String json) {
    if (isBlank(json)) return List.of();
    try {
      return objectMapper.readValue(json, new TypeReference<List<String>>() {});
    } catch (Exception e) {
      return List.of();
    }
  }

  private List<String> listValue(Object value) {
    if (value instanceof List<?> list) {
      return list.stream().map(String::valueOf).collect(Collectors.toList());
    }
    return List.of();
  }

  private <T> Page<T> pageList(List<T> list, int page, int size) {
    Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
    int start = Math.min((int) pageable.getOffset(), list.size());
    int end = Math.min(start + pageable.getPageSize(), list.size());
    return new PageImpl<>(list.subList(start, end), pageable, list.size());
  }

  private boolean keywordMatch(Object entity, String keyword) {
    if (isBlank(keyword)) return true;
    return List.of("getTitle", "getName", "getPhone", "getAuthor", "getSinger", "getPublisher", "getCategoryName", "getTypeName", "getSubTypeName")
        .stream()
        .map(method -> invoke(entity, method))
        .filter(Objects::nonNull)
        .anyMatch(value -> contains(String.valueOf(value), keyword));
  }

  private boolean adminPlatformMatch(Object entity, String platform) {
    if (isBlank(platform)) return true;
    Object value = invoke(entity, "getPlatform");
    if ("all".equals(platform)) return value == null || isBlank(String.valueOf(value));
    return Objects.equals(String.valueOf(value), platform) || containsCsv(String.valueOf(value), platform);
  }

  private boolean adminTypeMatch(Object entity, String type) {
    if (isBlank(type)) return true;
    if (entity instanceof CategoryEntity category) {
      return Objects.equals(String.valueOf(category.getCategoryId()), type);
    }
    Object value = invoke(entity, "getType");
    if (value == null || isBlank(String.valueOf(value))) return false;
    return Objects.equals(String.valueOf(value), type) || containsCsv(String.valueOf(value), type);
  }

  /**
   * 列表默认：排序值递减、更新时间递减、id 递增。
   * 分类表先按类型、分类、子分类聚在一起，便于后台合并单元格。
   */
  private int compareListOrder(Object left, Object right) {
    if (left instanceof CategoryEntity leftCategory && right instanceof CategoryEntity rightCategory) {
      int categoryCompare = Integer.compare(nullToZero(leftCategory.getCategoryId()), nullToZero(rightCategory.getCategoryId()));
      if (categoryCompare != 0) return categoryCompare;
      int typeCompare = Integer.compare(nullToZero(leftCategory.getTypeId()), nullToZero(rightCategory.getTypeId()));
      if (typeCompare != 0) return typeCompare;
      int subTypeCompare = Integer.compare(nullToZero(leftCategory.getSubTypeId()), nullToZero(rightCategory.getSubTypeId()));
      if (subTypeCompare != 0) return subTypeCompare;
    }
    Integer leftSeq = intValue(invoke(left, "getSeq"));
    Integer rightSeq = intValue(invoke(right, "getSeq"));
    int seqCompare = Integer.compare(rightSeq == null ? 0 : rightSeq, leftSeq == null ? 0 : leftSeq);
    if (seqCompare != 0) return seqCompare;
    int timeCompare = Long.compare(updatedEpoch(right), updatedEpoch(left));
    if (timeCompare != 0) return timeCompare;
    Long leftId = longValue(invoke(left, "getId"));
    Long rightId = longValue(invoke(right, "getId"));
    return Long.compare(leftId == null ? 0L : leftId, rightId == null ? 0L : rightId);
  }

  private long updatedEpoch(Object entity) {
    Object updatedTime = invoke(entity, "getUpdatedTime");
    if (updatedTime instanceof Instant instant) return instant.toEpochMilli();
    Object updatedAt = invoke(entity, "getUpdatedAt");
    if (updatedAt instanceof Instant instant) return instant.toEpochMilli();
    if (updatedAt instanceof LocalDateTime time) {
      return time.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }
    return 0L;
  }

  private int nullToZero(Integer value) {
    return value == null ? 0 : value;
  }

  private Object convertId(Class<?> entityClass, String id) {
    Method getter = Arrays.stream(entityClass.getMethods())
        .filter(method -> method.getName().equals("getId"))
        .findFirst()
        .orElse(null);
    if (getter != null && getter.getReturnType().equals(Integer.class)) return Integer.valueOf(id);
    return Long.valueOf(id);
  }

  /**
   * Entity JSON 列配合 {@code @JsonRawValue} 时以字符串落库。
   * 管理端表单会把 JSON 解析成 Map/List，需先写回字符串，否则 Hibernate 持久化会 500。
   */
  private void stringifyJsonValues(Map<String, Object> body) {
    if (body == null || body.isEmpty()) return;
    for (Map.Entry<String, Object> entry : body.entrySet()) {
      Object value = entry.getValue();
      if (value instanceof Map || value instanceof List) {
        try {
          entry.setValue(objectMapper.writeValueAsString(value));
        } catch (JsonProcessingException ignored) {
        }
      }
    }
  }

  private void touchCreate(Object entity) {
    Instant now = Instant.now();
    setIfPresent(entity, "setCreatedTime", Instant.class, now);
    setIfPresent(entity, "setUpdatedTime", Instant.class, now);
  }

  private void touchUpdate(Object entity) {
    setIfPresent(entity, "setUpdatedTime", Instant.class, Instant.now());
  }

  private void setIfPresent(Object entity, String methodName, Class<?> argType, Object value) {
    try {
      Method method = entity.getClass().getMethod(methodName, argType);
      method.invoke(entity, value);
    } catch (Exception ignored) {
    }
  }

  private Object invoke(Object entity, String methodName) {
    try {
      return entity.getClass().getMethod(methodName).invoke(entity);
    } catch (Exception e) {
      return null;
    }
  }

  private Object firstPresent(Map<String, Object> body, String... keys) {
    for (String key : keys) {
      Object value = body.get(key);
      if (value != null && !isBlank(String.valueOf(value))) return value;
    }
    return null;
  }

  private boolean contains(String value, String keyword) {
    return value != null && keyword != null && value.toLowerCase().contains(keyword.toLowerCase());
  }

  private boolean containsCsv(String csv, String value) {
    if (isBlank(csv) || isBlank(value)) return false;
    return Arrays.asList(csv.split(",")).contains(value);
  }

  private boolean isBlank(String value) {
    return value == null || value.trim().isEmpty();
  }

  private String stringValue(Object value) {
    return value == null ? null : String.valueOf(value);
  }

  private Integer intValue(Object value) {
    if (value == null || isBlank(String.valueOf(value))) return null;
    if (value instanceof Number number) return number.intValue();
    return Integer.valueOf(String.valueOf(value));
  }

  private Long longValue(Object value) {
    if (value == null || isBlank(String.valueOf(value))) return null;
    if (value instanceof Number number) return number.longValue();
    return Long.valueOf(String.valueOf(value));
  }

  private <T> ResponseEntity<CommonResponse<T>> ok(T data) {
    return ResponseEntity.ok(CommonResponse.success(data));
  }

  private <T> ResponseEntity<CommonResponse<T>> fail(HttpStatus status, String message) {
    return ResponseEntity.status(status).body(CommonResponse.fail(status.value(), message));
  }
}
