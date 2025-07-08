package com.lizhao.unispringboot.repository.user;

import com.lizhao.unispringboot.entity.user.UserDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDetailRepository extends JpaRepository<UserDetail, Long> {
}