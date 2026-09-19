package com.lizhao.yizhao.repository;

import com.lizhao.yizhao.entity.UploadedFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UploadedFileRepository extends JpaRepository<UploadedFileEntity, Integer> {
}
