const mysql = require("mysql");
const inquirer = require("inquirer");
// const consoletable = require("console.table");

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "mysql",
  database: "employee_DB",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  // run the start function after the connection is made to prompt the user
  startApp();
});

const startApp = () => {
  inquirer
    .prompt({
      type: "list",
      name: "Base",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "View All Employees by Department",
        "View All Employees by Manager",
        "Add Employee",
        "Add New Department",
        "View Departments",
        "Add New Role",
        "View Roles",
        "Remove Employee",
        "Remove Role",
        "Remove Department",
        "Update Employee role",
        "Update Employee Manager",
        "View Department Budget",
        "Exit",
      ],
    })
    .then((answer)=> {
      switch (answer.Base) {
        //   Need to create all case functions
        case "View All Employees":
          showAllEmployees();
          break;

        case "View All Employees by Department":
          showAllByDept();
          break;

        case "View All Employees by Manager":
          showAllByManager();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Add New Department":
          addNewDepartment();
          break;

        case "View Departments":
          viewDepartments();
          break;

        case "Add New Role":
          addNewRole();
          break;

        case "View Roles":
          viewRoles();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Remove Role":
          removeRole();
          break;

        case "Remove Department":
          removeDepartment();
          break;

        case "Update Employee role":
          updateEmployeeRole();
          break;

        case "Update Employee Manager":
          updateEmployeeManager();
          break;

        case "View Department Budget":
          viewDepartmentBudget();
          break;

        case "Exit":
          connection.end();
          process.exit();
      }
    });
};

// Viewing all employees in the table 
const showAllEmployees=()=> {
  console.log("Viewing all employees");
  connection.query(
      `SELECT employee.id,employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, concat(manager.first_name, " ", manager.last_name) AS Manager FROM role 
        INNER JOIN department ON department.id = role.department_id RIGHT JOIN employee ON role.id = employee.role_id LEFT JOIN employee manager ON employee.manager_id = manager.id`,
     (err, res)=> {
      if (err) throw err;
      console.table(res);
      startApp();
    }
  );
}

//Viewing employees by Department
const showAllByDept = () => {
  connection.query("select * from department", (err, res) => {
    inquirer
      .prompt({
        name: "departmentSearch",
        type: "list",
        message: "Which department would you like to search by?",
        choices: res.map((department) => {
          return { name: department.name, value: department.id };
        }),
      })
      .then(response => {
        connection.query(
          `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, 
            department.name AS department, concat(manager.first_name, " ", manager.last_name) AS Manager 
            from department join role on department.id=role.department_id
            join employee on employee.role_id = role.id
            left join employee manager ON employee.manager_id = manager.id
            where department.id=${response.departmentSearch}`,
           (err, res)=> {
            if (err) throw err;
            console.table(res);
            startApp();
          }
        );
      });
  });
}

//Viewing all employees by Manager name
const showAllByManager=()=> {
  connection.query("select * from employee where manager_id is null;", (err, res) => {
    inquirer
      .prompt({
        name: "managerSearch",
        type: "list",
        message: "Which manager would you like to search by?",
        choices: res.map((employee) => {
          return { name: employee.first_name + " " + employee.last_name, value: employee.id };
        }),
      })
      .then(response => {
        connection.query(
          `SELECT employee.id,employee.first_name, employee.last_name, role.title, role.salary, 
                    department.name AS department, concat(manager.first_name, " ", manager.last_name) AS Manager 
                    FROM role INNER JOIN department ON department.id = role.department_id 
                    RIGHT JOIN employee ON role.id = employee.role_id
                    LEFT JOIN employee manager ON employee.manager_id = manager.id
                    where employee.manager_id=${response.managerSearch}`,
           (err, res)=> {
            if (err) throw err;
            console.table(res);
            startApp();
          }
        );
      });
  });
}

//Adding new employee to Employee table
const addEmployee=()=> {
  connection.query("SELECT * FROM role", (err, res) => {
    inquirer
      .prompt([
        {
          type: "input",
          name: "firstName",
          message: "What is the employees first name?",
        },
        {
          type: "input",
          name: "lastName",
          message: "What is the employees last name?",
        },
        {
          type: "list",
          name: "role",
          message: "What is the role",
          choices: res.map((role) => {
            return { name: role.title, value: role.id };
          }),
        },
      ])
      .then((res)=> {
        connection.query("SELECT * FROM employee", (err, results) => {
          inquirer
            .prompt({
              type: "list",
              name: "manager",
              choices: results.map((employee) => {
                return { name: employee.first_name + " " + employee.last_name, value: employee.id };
              }),
              message: "Who is their manager?",
            })

            .then(answer => {
              connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [res.firstName, res.lastName, res.role, answer.manager], (err, data)=> {
                if (err) throw err;
                console.log("New Employee added!");
                startApp();
              });
            });
        });
      });
  });
}

//Adding new Departments to department table
const addNewDepartment=()=> {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "What is the department that you want to add?",
      },
    ])
    .then((res)=> {
      connection.query("INSERT INTO department (name) VALUES (?)", [res.department], (err, res)=> {
        if (err) throw err;
        console.table("New Department added!");
        startApp();
      });
    });
}

// View all Departments
const viewDepartments=()=> {
  console.log("View all departments");
  connection.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}

//Adding new role to role table with salary
const addNewRole=()=> {
  connection.query("SELECT * FROM department", (err, res) => {
    inquirer
      .prompt([
        {
          type: "input",
          name: "role",
          message: "What is the role that you want to add?",
        },
        {
          type: "input",
          name: "salary",
          message: "What's the salary for the new role?",
        },
        {
          type: "list",
          name: "department",
          message: "Which department does this role belongs?",
          choices: res.map((department) => {
            return { name: department.name, value: department.id };
          }),
        },
      ])
      .then(response => {
        connection.query("INSERT INTO role (title, salary, department_id) VALUES (?,?,?)", [response.role, response.salary, response.department], (err, res)=> {
          if (err) throw err;
          console.log("New Role added to role table");
          startApp();
        });
      });
  });
}

//Viewing all roles from role table
const viewRoles=()=> {
  console.log("View all Roles");
  connection.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}

// Deleting specific Employee from employee table
const removeEmployee=()=> {
  connection.query("select * from employee;", (err, res) => {
    inquirer
      .prompt({
        name: "employeeSearch",
        type: "list",
        message: "Which employee would you like to remove?",
        choices: res.map((employee) => {
          return { name: employee.first_name + " " + employee.last_name, value: employee.id };
        }),
      })
      .then(response => {
        connection.query(`DELETE FROM employee WHERE id=${response.employeeSearch}`, (err, res)=> {
          if (err) throw err;
          console.log("Employee Removed");
          startApp();
        });
      });
  });
}

// Deleting certain role from role table
const removeRole = () => {
  connection.query("select * from role", (err, res) => {
    inquirer
      .prompt({
        name: "roleSearch",
        type: "list",
        message: "Which role would you like to remove?",
        choices: res.map((role) => {
          return { name: role.title, value: role.id };
        }),
      })
      .then(response => {
        connection.query(`DELETE FROM role WHERE id=${response.roleSearch}`, (err, res) => {
          if (err) throw err;
          console.log("Role Removed");
          startApp();
        });
      });
  });
};

// Deleting certain department
const removeDepartment = () => {
  connection.query("select * from department", (err, res) => {
    inquirer
      .prompt({
        name: "departmentSearch",
        type: "list",
        message: "Which department would you like to remove?",
        choices: res.map((department) => {
          return { name: department.name, value: department.id };
        }),
      })
      .then((response) => {
        connection.query(`DELETE FROM department WHERE id=${response.departmentSearch}`, (err, res) => {
          if (err) throw err;
          console.log("Department Removed!");
          startApp();
        });
      });
  });
}

// Updating Employee's role
const updateEmployeeRole=()=> {
  connection.query("SELECT * FROM employee", (err, results) => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "employee",
          message: "Which employee needs a new role?",
          choices: results.map((employee) => {
            return { name: employee.first_name + " " + employee.last_name, value: employee.id };
          }),
        },
      ])
      .then(response => {
        connection.query("SELECT * FROM role", (err, results) => {
          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "What is their new role?",
                choices: results.map((role) => {
                  return { name: role.title, value: role.id };
                }),
              },
            ])
            .then(answer => {
              connection.query("UPDATE employee SET role_id = ? WHERE  id = ? ", [answer.role, response.employee], (err, res) => {
                if (err) {
                  console.log(err, "error!");
                }
                console.log("Employee Role Updated!");
                startApp();
              });
            });
        });
      });
  });
}


// Changing Employee's Manager
const updateEmployeeManager=()=> {
  connection.query("SELECT * FROM employee where manager_id is not null;", (err, results) => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "employee",
          message: "Which employee needs a new manager?",
          choices: results.map((employee) => {
            return { name: employee.first_name + " " + employee.last_name, value: employee.id };
          }),
        },
      ])
        .then(response => {
          let index = results.findIndex(result => result.id === response.employee)
        connection.query("SELECT * FROM employee WHERE manager_id is null AND id <> ?", [results[index].manager_id], (err, results) => {
          inquirer
            .prompt([
              {
                type: "list",
                name: "manager",
                message: "Who will be the new manager?",
                choices: results.map((employee) => {
                  return { name: employee.first_name + " " + employee.last_name, value: employee.id };
                }),
              },
            ])
            .then(answer => {
              connection.query("UPDATE employee SET manager_id = ? WHERE  id = ? ", [answer.manager, response.employee], (err, res) => {
                if (err) {
                  console.log(err, "error!");
                }
                console.log("Employee manager Updated!");
                startApp();
              });
            });
        });
      });
  });
}

// Viewing all department total budgets
const viewDepartmentBudget=()=> {
   console.log("View all Departments Budget");
   connection.query(`SELECT department.name AS department, SUM(role.salary) budget
                    FROM employee  JOIN role ON role_id = role.id 
                    JOIN department ON role.department_id = department.id 
                    GROUP BY department.name;`, (err, res) => {
     if (err) throw err;
     console.table(res);
     startApp();
   }); 
}
