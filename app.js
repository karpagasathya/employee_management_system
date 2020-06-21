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
          "Add Department",
          "Remove Employee",
          "Update Employee role",
          "Update Employee Manager",
          "Exit"
        ],
      })
      .then(function (answer) {
        switch (answer.Base) {
          //   Need to create all case functions
          case "View All Employees":
            showEmployees();
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
            
          case "Add Department":
            addDepartment();
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

function showEmployees(){
    console.log("Viewing all employees");
    // const query = "SELECT * FROM employee"
    connection.query(`SELECT employee.id,employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, concat(manager.first_name, " ", manager.last_name) AS Manager FROM role INNER JOIN department ON department.id = role.department_id RIGHT JOIN employee ON role.id = employee.role_id LEFT JOIN employee manager ON employee.manager_id = manager.id`, function (err, res) {
        if (err) throw err;
        console.table(res);
        startApp();
    });
};

function showAllByDept(){
    inquirer.prompt({
        name: "deptSearch",
        type: "list",
        message: "What department would you like to search by?",
        choices:["Engineering","Marketing","Legal","Finance"]
    })
        .then(function (answer) {

            connection.query(
              "SELECT * FROM employee LEFT JOIN role ON role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.name = ?;",
              answer.deptSearch,
              function (err, res) {
                  if (err) throw err;
                console.table(res);  
                // for (let i = 0; i < res.length; i++) {
                //   console.table("ID: " + res[i].id + " || First Name: " + res[i].first_name + " || Last Name: " + res[i].last_name);
                // }
                startApp();
              }
            );
        })
}

// function showAllByManager() {
//     connection.query("select * from employee where manager_id is not null;", (err, result) => {
//         inquirer.prompt({
//         name: "managerSearch",
//         type: "list",
//         message: "Which manager would you like to search by?",
//         choices: result.map(employee => { return { name: employee.first_name + " " + employee.last_name, value: employee.id } })
        
//         })
//             .then(function (answer) {
            
//         })
//         })
// }


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
                        return { name: role.title, value:role.id};
                    }),
                },
            ])
            .then(function (res) {
                connection.query("SELECT * FROM employee", (err, results) => {
                    inquirer
                        .prompt({
                            type: "list",
                            name: "manager",
                            choices: results.map(employee => { return { name: employee.first_name + " " + employee.last_name, value: employee.id } }),
                            message: "Who is their manager?"
                        })
            
                        .then(function (answer) {
                            connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [res.firstName, res.lastName, res.role, answer.manager], function (err, data) {
                                if (err) throw err;
                                console.log("Successfully Inserted");
                                startApp();
                            });
                        });
                })
            })
    })
}

function addDepartment() {
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
          console.table(data);
        startApp();
      });
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
    let employeeList = [];
  connection.query("SELECT employee.first_name, employee.last_name FROM employee", (err,res) => {
      for (let i = 0; i < res.length; i++){
        employeeList.push(res[i].first_name + " " + res[i].last_name);
      }
          inquirer.prompt([
              {
                  type: "list",
                  name: "employeeName",
                  message: "Which employee do you want to delete?",
                  choices: employeeList
              }
          ])
              .then(function (answer) {
                  connection.query(`DELETE FROM employee WHERE concat(first_name, ' ' ,last_name) = '${answer.employeeName}'`,
                      function (err, res) {
                          if (err) throw err;
                          console.log("Employee deleted!\n");
                          startApp();
                      }); 
              });
    })
}