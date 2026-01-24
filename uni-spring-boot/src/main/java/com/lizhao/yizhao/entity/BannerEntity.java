package com.lizhao.yizhao.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "banner")
public class BannerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "image", length = 500)
    private String image;

    @Column(name = "url", length = 500)
    private String url;

    @Column(name = "seq")
    private Integer seq;

    @Column(name = "jump_to", length = 50)
    private String jumpTo;

    @JsonFormat(shape = JsonFormat.Shape.NUMBER)
    @Column(name = "created_time")
    private Instant createdTime;

    @JsonFormat(shape = JsonFormat.Shape.NUMBER)
    @Column(name = "updated_time")
    private Instant updatedTime;

    @Column(name = "is_deleted", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isDeleted;

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Integer getSeq() {
        return seq;
    }

    public void setSeq(Integer seq) {
        this.seq = seq;
    }

    public String getJumpTo() {
        return jumpTo;
    }

    public void setJumpTo(String jumpTo) {
        this.jumpTo = jumpTo;
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