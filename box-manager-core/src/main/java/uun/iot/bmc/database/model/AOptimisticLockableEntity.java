package uun.iot.bmc.database.model;


import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;
import jakarta.validation.constraints.NotNull;
import lombok.ToString;

@MappedSuperclass
@ToString
public abstract class AOptimisticLockableEntity extends AAuditableEntity {

    @Version
    @Column(name = "version", nullable = false)
    @NotNull
    protected Long version;

    public Long getVersion() {
        return version;
    }

    public AOptimisticLockableEntity setVersion(Long version) {
        this.version = version;
        return this;
    }
}
