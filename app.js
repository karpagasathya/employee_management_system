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
        "Update Employee role",
        "Update Employee Manager",
        "Exit",
      ],
    })
    .then(function (answer) {
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
        case "Update Employee role":
          updateEmployeeRole();
          break;
        case "Update Employee Manager":
          updateEmployeeManager();
          break;
        case "Exit":
          connection.end();
          process.exit();
      }
    });
};

function showAllEmployees() {
  console.log("Viewing all employees");
  // const query = "SELECT * FROM employee"
  connection.query(
    `SELECT employee.id,employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, concat(manager.first_name, " ", manager.last_name) AS Manager FROM role INNER JOIN department ON department.id = role.department_id RIGHT JOIN employee ON role.id = employee.role_id LEFT JOIN employee manager ON employee.manager_id = manager.id`,
    function (err, res) {
      if (err) throw err;
      console.table(res);
      startApp();
    }
  );
}

function showAllByDept() {
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
      .then(function (response) {
        connection.query(
          `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, 
            department.name AS department, concat(manager.first_name, " ", manager.last_name) AS Manager 
            from department join role on department.id=role.department_id
            join employee on employee.role_id = role.id
            left join employee manager ON employee.manager_id = manager.id
            where department.id=${response.departmentSearch}`,
          function (err, res) {
            if (err) throw err;
            console.table(res);
            startApp();
          }
        );
      });
  });
}

function showAllByManager() {
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
      .then(function (response) {
        connection.query(
          `SELECT employee.id,employee.first_name, employee.last_name, role.title, role.salary, 
                    department.name AS department, concat(manager.first_name, " ", manager.last_name) AS Manager 
                    FROM role INNER JOIN department ON department.id = role.department_id 
                    RIGHT JOIN employee ON role.id = employee.role_id
                    LEFT JOIN employee manager ON employee.manager_id = manager.id
                    where employee.manager_id=${response.managerSearch}`,
          function (err, res) {
            if (err) throw err;
            console.table(res);
            startApp();
          }
        );
      });
  });
}

function addEmployee() {
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
      .then(function (res) {
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

            .then(function (answer) {
              connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [res.firstName, res.lastName, res.role, answer.manager], function (err, data) {
                if (err) throw err;
                console.log("Successfully Inserted");
                startApp();
              });
            });
        });
      });
  });
}

function addNewDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "What is the department that you want to add?",
      },
    ])
    .then(function (res) {
      connection.query("INSERT INTO department (name) VALUES (?)", [res.department], function (err, data) {
        if (err) throw err;
        console.table("Successfully Inserted");
        startApp();
      });
    });
}

function viewDepartments() {
  console.log("View all departments");
  connection.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}

function addNewRole() {
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
      .then(function (response) {
        connection.query("INSERT INTO role (title, salary, department_id) VALUES (?,?,?)", [response.role, response.salary, response.department], function (err, data) {
          if (err) throw err;
          console.log("New Role added to role table");
          startApp();
        });
      });
  });
}

function viewRoles() {
  console.log("View all Roles");
  connection.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}

// function updateEmployeeRole() {
//     let employeeList = [];
//     connection.query("SELECT employee.first_name, employee.last_name FROM employee", (err, res) => {
//         for (let i = 0; i < res.length; i++) {
//             employeeList.push(res[i].first_name + " " + res[i].last_name);
//         }
//         inquirer
//             .prompt([
//                 {
//                     type: "list",
//                     name: "employeeName",
//                     message: "which employee would you like to update? ",
//                     choices: employeeList
//                 },
//                 {
//                     type: "input",
//                     name: "role_id",
//                     message: "enter the new role ",
//                 },
//             ])
//             .then(function (res) {
//                 connection.query("UPDATE employee SET role_id = ? WHERE concat(first_name, ' ' ,last_name) = ?", [res.role_id, res.employeeName], function (err, data) {
//                     console.log("Updated");
//                     console.table(data);
//                     start();
//                 });

//             });
//     });
// }

function updateEmployeeRole() {
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
      .then((response) => {
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
            .then((answers) => {
              connection.query("UPDATE employee SET role_id = ? WHERE  id = ? ", [answers.role, response.employee], (err, results) => {
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

function removeEmployee() {
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
      .then(function (response) {
        connection.query(
          `DELETE FROM employee WHERE id=${response.employeeSearch}`,
          function (err, res) {
              if (err) throw err;
              console.log("Employee Removed");
            startApp();
          }
        );
      });
  });
}

// function removeEmployee() {
//   let employeeList = [];
//   connection.query("SELECT employee.first_name, employee.last_name FROM employee", (err, res) => {
//     for (let i = 0; i < res.length; i++) {
//       employeeList.push(res[i].first_name + " " + res[i].last_name);
//     }
//     inquirer
//       .prompt([
//         {
//           type: "list",
//           name: "employeeName",
//           message: "Which employee do you want to delete?",
//           choices: employeeList,
//         },
//       ])
//       .then(function (answer) {
//         connection.query(`DELETE FROM employee WHERE concat(first_name, ' ' ,last_name) = '${answer.employeeName}'`, function (err, res) {
//           if (err) throw err;
//           console.log("Employee deleted!\n");
//           startApp();
//         });
//       });
//   });
// }
