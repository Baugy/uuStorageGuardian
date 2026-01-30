package uun.iot.bmc.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

public class ApplicationException extends ErrorResponseException {


    public ApplicationException(HttpStatus status, String message) {
        super(status, ProblemDetail.forStatusAndDetail(status, message), null, null, null);
    }

}
