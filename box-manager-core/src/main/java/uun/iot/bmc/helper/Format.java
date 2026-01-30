package uun.iot.bmc.helper;

import org.slf4j.helpers.MessageFormatter;
import org.springframework.lang.Nullable;

public final class Format {

    private Format() {
        ClassHelper.throwCannotInstantiateUtilityClass();
    }

    public static String message(String message, @Nullable Object... parameters) {
        return MessageFormatter.arrayFormat(message, parameters).getMessage();
    }

}
