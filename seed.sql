USE employee_DB;

INSERT INTO department (name) VALUES ("Engineering"),("Marketing"),("Legal"),("Finance");

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES 
('Sarah', 'Leer', 1, NULL), 
('Mike', 'Peterson', 2,1 ), 
('Sara', 'Vanhove', 3, NULL),
('Patrick', 'Muller', 4, 3), 
('Laura', 'Cognar', 5, NULL),
('sathya', 'guru', 6, 5), 
('Brian', 'Stoner', 7, NULL),
('Amanda', 'Marx', 8,7);


INSERT INTO role
    (title, salary, department_id)
VALUES
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 2),
    ('Software Engineer', 120000, 2),
    ('Account Manager', 160000, 3),
    ('Accountant', 125000, 3),
    ('Legal Team Lead', 250000, 4),
    ('Lawyer', 190000, 4);