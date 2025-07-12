package com.lizhao.yizhao.authority;

import com.lizhao.yizhao.user.UserInfoRepository;
import com.lizhao.yizhao.user.UserInfoEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
  private final UserInfoRepository userInfoRepository;

  public UserDetailsServiceImpl(UserInfoRepository userInfoRepository) {
    this.userInfoRepository = userInfoRepository;
  }

  @Override
  @Transactional
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    UserInfoEntity userInfo = userInfoRepository.findByUserName(username)
      .or(() -> userInfoRepository.findByPhone(username))
      .orElseThrow(() -> new UsernameNotFoundException("找不到用户: " + username));

    return UserDetailsImpl.build(userInfo);
  }
}