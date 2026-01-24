package com.lizhao.yizhao.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "category", uniqueConstraints = {
    @UniqueConstraint(name = "uk_category_type", columnNames = {"category_id", "type_id", "sub_type_id"})
}, indexes = {
    @Index(name = "idx_category_id", columnList = "category_id"),
    @Index(name = "idx_created_time", columnList = "created_time"),
    @Index(name = "idx_is_deleted", columnList = "is_deleted")
})
public class CategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    @Column(name = "category_name", nullable = false, length = 100)
    private String categoryName;

    @Column(name = "type_id")
    private Integer typeId;

    @Column(name = "type_name", length = 100)
    private String typeName;

    @Column(name = "sub_type_id")
    private Integer subTypeId;

    @Column(name = "sub_type_name", length = 100)
    private String subTypeName;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.NUMBER)
    private Instant createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.NUMBER)
    private Instant updatedTime;

    @Column(name = "is_deleted", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isDeleted;

    // Constructors
    public CategoryEntity() {}

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Integer getTypeId() {
        return typeId;
    }

    public void setTypeId(Integer typeId) {
        this.typeId = typeId;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public Integer getSubTypeId() {
        return subTypeId;
    }

    public void setSubTypeId(Integer subTypeId) {
        this.subTypeId = subTypeId;
    }

    public String getSubTypeName() {
        return subTypeName;
    }

    public void setSubTypeName(String subTypeName) {
        this.subTypeName = subTypeName;
    }

    public Instant getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(Instant createdTime) {
        this.createdTime = createdTime;
    }

    public Instant getUpdatedTime() {
        return updatedTime;
    }

    public void setUpdatedTime(Instant updatedTime) {
        this.updatedTime = updatedTime;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
}
