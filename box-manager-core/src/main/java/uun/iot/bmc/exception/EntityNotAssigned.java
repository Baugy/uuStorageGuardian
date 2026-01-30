package uun.iot.bmc.exception;

import org.springframework.http.HttpStatus;

import static uun.iot.bmc.helper.Format.message;

public class EntityNotAssigned extends ApplicationException {

    public EntityNotAssigned(String entity, Object entityId, String assignEntity, HttpStatus status) {
        super(status, message("{} ID [{}] is not assigned to {}", entity, entityId, assignEntity));
    }

    public static EntityNotAssigned badRequest(String entity, Object entityId, String assignEntity) {
        return new EntityNotAssigned(entity, entityId, assignEntity, HttpStatus.BAD_REQUEST);
    }

}
