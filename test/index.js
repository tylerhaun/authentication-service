const assert = require("assert");
const dotenv = require("dotenv");
const childProcess = require('child_process');

dotenv.config({path: "test/.env.test"})

const UserApi = require("./UserApi");
const PasswordApi = require("./PasswordApi");



class Main {

  async run() {
    console.log("run()");

    const userApi = new UserApi();
    const passwordApi = new PasswordApi();

    const userData = {
      username: "username1023",
      email: "test@example.com",
      phoneNumber: process.env.TEST_PHONE_NUMBER,
      //phoneNumber: "+852 6569-8900",
      //phoneNumber: "555 123 1234",
      password: "test",
      //emailVerification: true,
      smsVerification: true,
    }
    const createUserResponse = await userApi.create(userData);
    console.log("createUserResponse", createUserResponse);

    const users = await userApi.get();
    console.log("users", users);

    const passwords = await passwordApi.get();
    console.log("passwords", passwords);


    console.log("\x1b[32m", "done", "\x1b[0m");

  }

  async main() {

    const server = await this.startServer()
      .catch(error => {
        console.log("server error");
        console.error(error);
      });
    console.log("server started");
    await this.run()
      .catch(error => {
        console.log("error occured; killing server...");
        return new Promise(function(resolve, reject) {
          setTimeout(() => {
            server.kill();
            console.log("server killed");
            return reject(error);
          }, 1000)
        })
      })

    server.kill();

  }


  async startServer() {

    return new Promise(function(resolve, reject) {

      const scriptPath = "./src/index.js";
      var server = childProcess.fork(scriptPath, [], {silent: true});

      server.on('spawn', function (err) {
        console.log("spawned", err);
      });
      server.on('error', function (err) {
        console.error("error", err);
      });

      server.on('exit', function (code, signal) {
        console.log("server exited", code, signal);
      });
      server.on('close', function (code, signal) {
        console.log("server exited", code, signal);
      });


      server.stdout.on('data', function(data) {
        console.log("server stdout", data.toString()); 
      });
      server.stderr.on('data', function(data) {
        console.log("server stderr");
        console.error(data.toString()); 
      });

      console.log("waiting for server to start...");
      server.on("message", (m) => {
        console.log("received message", m);
        if (m == "server.started") {
          return resolve(server);
        }
      })

    })

  }

}


const main = new Main();
main.main()
  .catch(error => {
    console.log("error in main");
    console.error(error);
  });

