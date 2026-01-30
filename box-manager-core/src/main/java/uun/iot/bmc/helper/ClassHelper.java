package uun.iot.bmc.helper;

public final class ClassHelper {

    private ClassHelper() {
        throwCannotInstantiateUtilityClass();
    }

    public static void throwCannotInstantiateUtilityClass() {
        throw new IllegalStateException("Cannot instantiate utility class!");
    }
}
