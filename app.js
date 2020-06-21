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
  // run the start function after the connection is made to prompt the user
  start();
});

const start = () => {
    inquirer.prompt({
        name: "Base",
        type: "list",
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
        ]
    })
    .then(function(answer) {
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

          default:
            return process.exit();
        }
    })
};

function showEmployees(){
    console.log("Viewing all employees");
    const query = "SELECT * FROM employee"
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
    });
};

function showAllByDept(){
    inquirer.prompt({
        name: "deptSearch",
        type: "input",
        message: "What department would you like to search by?"
    })
        .then(function (answer) {

            connection.query(
              "SELECT * FROM employee LEFT JOIN role ON role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.id = ?;",
              answer.deptSearch,
              function (err, res) {
                if (err) throw err;
                for (let i = 0; i < res.length; i++) {
                  console.table("ID: " + res[i].id + " || First Name: " + res[i].first_name + " || Last Name: " + res[i].last_name);
                }
                start();
              }
            );
        })
}


function addEmployee() {
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
        type: "number",
        name: "roleId",
        message: "What is the employees role ID",
      },
      {
        type: "number",
        name: "managerId",
        message: "What is the employees manager's ID?",
      },
    ])
    .then(function (res) {
      connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [res.firstName, res.lastName, res.roleId, res.managerId], function (err, data) {
        if (err) throw err;
        console.table("Successfully Inserted");
        start();
      });
    });
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
        start();
      });
    });
}

function updateEmployeeRole() {
    let employeeList = [];
    connection.query("SELECT employee.first_name, employee.last_name FROM employee", (err, res) => {
        for (let i = 0; i < res.length; i++) {
            employeeList.push(res[i].first_name + " " + res[i].last_name);
        }
        inquirer
            .prompt([
                {
                    type: "list",
                    name: "employeeName",
                    message: "which employee would you like to update? ",
                    choices: employeeList
                },
                {
                    type: "input",
                    name: "role_id",
                    message: "enter the new role ",
                },
            ])
            .then(function (res) {
                connection.query("UPDATE employee SET role_id = ? WHERE concat(first_name, ' ' ,last_name) = ?", [res.role_id, res.employeeName], function (err, data) {
                    console.log("Updated");
                    console.table(data);
                    start();
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
                        //   console.table(answer);
                          start();
                      }); 
              });
    })
}