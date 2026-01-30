package uun.iot.bmc.database.model;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.NotNull;
import lombok.ToString;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@ToString
public abstract class AAuditableEntity extends AEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    @NotNull
    protected LocalDateTime createdAt;

    @CreatedBy
    @Column(name = "created_by", nullable = false)
    @NotNull
    protected String createdBy;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    @NotNull
    protected LocalDateTime updatedAt;

    @LastModifiedBy
    @Column(name = "updated_by", nullable = false)
    @NotNull
    protected String updatedBy;

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public AAuditableEntity setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public AAuditableEntity setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public AAuditableEntity setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public AAuditableEntity setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
        return this;
    }
}
