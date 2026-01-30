package uun.iot.bmc.service.api;



public interface MeasurementService {

    void saveMeasurement(Double temperature, Double humidity, Long deviceId, Long timestamp);

}
