package uun.iot.bmc.exception;

import org.springframework.http.HttpStatus;

import static uun.iot.bmc.helper.Format.message;

public class EntityDoesNotExist extends ApplicationException {

    public EntityDoesNotExist(String entity, Object entityId, HttpStatus status) {
        super(status, message("{} ID [{}] does not exist.", entity, entityId));
    }

    public static EntityDoesNotExist notFound(String entity, Object entityId) {
        return new EntityDoesNotExist(entity, entityId, HttpStatus.NOT_FOUND);
    }

}
