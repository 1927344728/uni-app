package com.lizhao.yizhao.config.authority;

import com.lizhao.yizhao.entity.UserEntity;
import com.lizhao.yizhao.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
  private final UserRepository userRepository;

  public UserDetailsServiceImpl(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  @Transactional
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    UserEntity userInfo = userRepository.findByName(username)
      .or(() -> userRepository.findByPhone(username))
      .orElseThrow(() -> new UsernameNotFoundException("找不到用户: " + username));

    return UserDetailsImpl.build(userInfo);
  }
}