package uun.iot.bmc.exception;

public final class SneakyThrow {

    public static <E extends Throwable> void sneakyThrow(Throwable e) throws E {
        //noinspection unchecked
        throw (E) e;
    }
}
