package uun.iot.bmc.exception;

import org.springframework.http.HttpStatus;

import static uun.iot.bmc.helper.Format.message;

public class AccessDeniedException extends ApplicationException {

    public AccessDeniedException(String entity, Object entityId, HttpStatus status) {
        super(status, message("Forbidden", entity, entityId));
    }

    public static AccessDeniedException forbidden(String entity, Object entityId) {
        return new AccessDeniedException(entity, entityId, HttpStatus.FORBIDDEN);
    }
}
