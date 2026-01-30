package uun.iot.bmc.database.repository;

import com.influxdb.v3.client.InfluxDBClient;
import com.influxdb.v3.client.Point;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import uun.iot.bmc.service.model.box.BoxStatus;
import uun.iot.bmc.service.model.measurement.MeasurementPoint;
import uun.iot.bmc.service.model.measurement.MeasurementRecord;

import java.math.BigInteger;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Stream;

@Repository
@Slf4j
public class MeasurementRepository {

    private final InfluxDBClient influxDBClient;

    public MeasurementRepository(InfluxDBClient influxDBClient) {
        this.influxDBClient = influxDBClient;
    }

    public void save(MeasurementPoint measurement) {
        Point point = Point.measurement("climate")
                .setTag("boxId", String.valueOf(measurement.getBoxId()))
                .setTag("renterId", measurement.getRenterId())
                .setTag("deviceId", String.valueOf(measurement.getDeviceId()))
                .setField("temperature", measurement.getTemperature())
                .setField("humidity", measurement.getHumidity())
                .setField("status", measurement.getStatus().getValue())
                .setTimestamp(Instant.ofEpochMilli(measurement.getTimestamp().getTime()).plusSeconds(3600)); // Adjusting for timezone if needed
        influxDBClient.writePoint(point);
    }

    public MeasurementRecord getLastBoxMeasurement(Long boxId) {
        Stream<Object[]> measurements = influxDBClient.query("SELECT \"boxId\", \"renterId\", \"deviceId\", \"temperature\", \"humidity\", \"status\", \"time\" FROM climate WHERE \"boxId\" = " + boxId + "AND time = (SELECT MAX(time) FROM climate where \"boxId\" = " + boxId + ")");
        MeasurementRecord measurementRecord = new MeasurementRecord();
        return measurements.findFirst().map(measurement -> measurementRecord.withBoxId(Long.parseLong(measurement[0].toString()))
                            .withRenterId(measurement[1].toString())
                            .withDeviceId(Long.parseLong(measurement[2].toString()))
                            .withTemperature((Double) measurement[3])
                            .withHumidity((Double) measurement[4])
                            .withStatus(BoxStatus.valueOf(measurement[5].toString()))
                            .withMeasurementDate(LocalDateTime.ofInstant(
                                    Instant.ofEpochSecond(((BigInteger) measurement[6]).longValue() / 1_000_000_000L, ((BigInteger) measurement[6]).longValue() % 1_000_000_000L), ZoneOffset.UTC))
                )
                .orElse(measurementRecord);
    }

    public MeasurementRecord getLastDeviceMeasurement(Long deviceId) {
        Stream<Object[]> measurements = influxDBClient.query("SELECT \"boxId\", \"renterId\", \"deviceId\", \"temperature\", \"humidity\", \"status\", \"time\" FROM climate WHERE \"deviceId\" = " + deviceId + "AND time = (SELECT MAX(time) FROM climate where \"deviceId\" = " + deviceId + ")");
        MeasurementRecord measurementRecord = new MeasurementRecord();
        return measurements.findFirst().map(measurement -> measurementRecord.withBoxId(Long.parseLong(measurement[0].toString()))
                        .withRenterId(measurement[1].toString())
                        .withDeviceId(Long.parseLong(measurement[2].toString()))
                        .withTemperature((Double) measurement[3])
                        .withHumidity((Double) measurement[4])
                        .withStatus(BoxStatus.valueOf(measurement[5].toString()))
                        .withMeasurementDate(LocalDateTime.ofInstant(
                                Instant.ofEpochSecond(((BigInteger) measurement[6]).longValue() / 1_000_000_000L, ((BigInteger) measurement[6]).longValue() % 1_000_000_000L), ZoneOffset.UTC))
                )
                .orElse(measurementRecord);
    }

    public List<MeasurementRecord> getMeasurements(Long boxId, String userId, LocalDateTime from, LocalDateTime to) {
        Stream<Object[]> measurements = influxDBClient.query("SELECT \"boxId\", \"temperature\", \"humidity\", \"status\", \"time\" FROM climate WHERE \"boxId\" = " + boxId +
                " AND time >= '" + from + "' AND time <= '" + to + "'" + (userId != null ? " AND \"renterId\" = '" + userId + "'" : "") + " ORDER BY time");
        return measurements.map(measurement -> new MeasurementRecord()
                    .withBoxId(Long.parseLong(measurement[0].toString()))
                    .withTemperature((Double) measurement[1])
                    .withHumidity((Double) measurement[2])
                    .withStatus(BoxStatus.valueOf(measurement[3].toString()))
                    .withMeasurementDate(LocalDateTime.ofInstant(
                            Instant.ofEpochSecond(((BigInteger) measurement[4]).longValue() / 1_000_000_000L, ((BigInteger) measurement[4]).longValue() % 1_000_000_000L), ZoneOffset.UTC))
                )
                .toList();
    }

}


