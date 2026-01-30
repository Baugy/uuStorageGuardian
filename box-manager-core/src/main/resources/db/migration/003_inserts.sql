INSERT INTO bmc.c_warehouse (name, description, location) VALUES ('Potravinársky sklad', 'Sklad pre uskladňovanie rôznych potravín', 'Bratislava Zlaté Piesky');

INSERT INTO bmc.c_warehouse (name, description, location) VALUES ('Vzácne materiály', 'Uskladňovanie vzácnych predmetov s vysokými požiadavkami na mikroklimatické podmienky', 'Bratislava Matador Petržalka');

INSERT INTO bmc.t_box(name, description, renter_id, device_id, warehouse_id, lower_humidity_limit, upper_humidity_limit, lower_temperature_limit, upper_temperature_limit)
  VALUES ('Box c.1', 'Box pre uskladnenie potravín s reguláciou teploty a vlhkosti', 'dummy', 1, 1, 1, 10, 0, 10);