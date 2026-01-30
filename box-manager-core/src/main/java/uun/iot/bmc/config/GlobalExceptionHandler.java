package uun.iot.bmc.config;

import jakarta.annotation.Nullable;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.*;
import org.springframework.lang.NonNull;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Stream;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {


    @Nullable
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(@NonNull Exception ex, @Nullable Object body, @SuppressWarnings("NullableProblems") @NonNull HttpHeaders headers, @NonNull HttpStatusCode statusCode, @NonNull WebRequest request) {
        log.error("Failed to handle {}: {}", request, ex.getMessage(), ex);
        return super.handleExceptionInternal(ex, body, headers, statusCode, request);
    }


    @ExceptionHandler
    public ResponseEntity<Object> handleThrowable(Throwable ex, @NonNull WebRequest request) {
        ErrorResponse.Builder builder = ErrorResponse.builder(ex, HttpStatusCode.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()), ex.getMessage());
        ProblemDetail problemDetail = builder.build().updateAndGetBody(getMessageSource(), LocaleContextHolder.getLocale());

        return this.createResponseEntity(problemDetail, null, HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    @ExceptionHandler
    public ResponseEntity<Object> handleConstraintViolationException(ConstraintViolationException ex, @NonNull WebRequest request) {
        final ProblemDetail body = createProblemDetail(ex, HttpStatus.BAD_REQUEST, "Constraint validation error", null, null, request);
        final Map<Object, Object> errors = new LinkedHashMap<>();

        ex.getConstraintViolations().forEach(violation -> {
            errors.put(violation.getPropertyPath().toString(), violation.getMessage());
        });

        if (!errors.isEmpty()) {
            body.setProperty("errors", errors);
        }

        //noinspection DataFlowIssue // headers are actually nullable
        return handleExceptionInternal(ex, body, null, HttpStatus.BAD_REQUEST, request);
    }


    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, @NonNull HttpHeaders headers, @NonNull HttpStatusCode status, @NonNull WebRequest request) {
        final Map<Object, Object> errors = new LinkedHashMap<>();

        Stream.concat(ex.getGlobalErrors().stream(), ex.getFieldErrors().stream()).forEach(error -> {
            String name = error.getObjectName();
            if (error instanceof FieldError fieldError) {
                name = fieldError.getField();
            }

            errors.put(name, resolveErrorMessage(error));
        });

        if (!errors.isEmpty()) {
            ex.getBody().setProperty("errors", errors);
        }

        return super.handleMethodArgumentNotValid(ex, headers, status, request);
    }

    private String resolveErrorMessage(ObjectError error) {
        if (getMessageSource() != null) {
            return getMessageSource().getMessage(error, LocaleContextHolder.getLocale());
        }

        return error.getDefaultMessage();
    }
}

