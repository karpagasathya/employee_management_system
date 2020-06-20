const mysql = require("mysql");
const inquirer = require("inquirer");

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
            "Remove Employee",
            "Update Employee role",
            "Update Employee Manager",
            "Exit"
        ]
    })
    .then(function(answer) {
        switch(answer.Base){
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
