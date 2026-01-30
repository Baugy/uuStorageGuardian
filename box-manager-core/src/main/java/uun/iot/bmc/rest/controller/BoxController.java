package uun.iot.bmc.rest.controller;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import uun.iot.bmc.rest.mapper.BoxRestMapper;
import uun.iot.bmc.rest.model.box.*;
import uun.iot.bmc.service.api.BoxService;

import java.time.LocalDateTime;
import java.util.List;

import static uun.iot.bmc.config.support.ApiPaths.BOX_API;

@RestController
@RequestMapping(value = BOX_API, produces = MediaType.APPLICATION_JSON_VALUE)
public class BoxController {

    private final BoxService boxService;
    private final BoxRestMapper boxRestMapper;

    public BoxController(BoxService boxService, BoxRestMapper boxRestMapper) {
        this.boxService = boxService;
        this.boxRestMapper = boxRestMapper;
    }

    @PostMapping
    public BoxDto createBox(@Valid @RequestBody BoxCreateDto boxCreate) {
        return boxRestMapper.toRestModel(boxService.createBox(boxCreate));
    }

    @PatchMapping("/{id}")
    public BoxDto updateBox(@PathVariable Long id, @Valid @RequestBody BoxUpdateDto boxUpdate) {
        return boxRestMapper.toRestModel(boxService.updateBox(id, boxUpdate));
    }

    @GetMapping
    public List<BoxListDto> getBoxes(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long warehouseId
    ) {
        return boxRestMapper.toRestModel(boxService.getBoxes(name, status, warehouseId));
    }

    @GetMapping("/{id}")
    public BoxDto getBox(@PathVariable Long id) {
        return boxRestMapper.toRestModel(boxService.getBox(id));
    }

    @GetMapping("/{id}/history")
    public List<BoxHistoryDto> getBoxHistory(@PathVariable Long id,
                                       @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
                                       @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo) {
        return boxRestMapper.toHistoryRestModel(boxService.getBoxHistory(id, dateFrom, dateTo));
    }

    @DeleteMapping("/{id}")
    public void deleteBox(@PathVariable Long id) {
        boxService.deleteBox(id);
    }



}
