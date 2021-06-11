const axios = require("axios");
const childProcess = require("child_process");
const dotenv = require("dotenv");

dotenv.config();



class TestServer {

  async start() {

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




before(async () => {  
  console.log("before");
  const testServer = new TestServer();
  console.log("starting test server...");
  await testServer.start();
  console.log("server started");
  //await Elastic.ensureIndices()
})





const axiosConfig = {
  baseURL: `http://localhost:${process.env.PORT}/`,
};
const apiRequest = axios.create(axiosConfig);

describe("Test test server", () => {
  it("should ping", async () => {
    const response = await apiRequest.get("ping");
    console.log("response", response);
  })
})



var userId; // TODO hacky; fix
describe("API", () => {
  describe("User", () => {
    describe("Create", () => {
      it("should successfully create a new user", async function() {
        this.timeout(5000);
        const userData = {
          username: "test",
          email: "test@test.com",
          phoneNumber: "716-555-5555",
          password: "test"
        };
        const result = await apiRequest.post("users", userData);
        console.log(result.status)
        console.log("result", result.data.id);
      })
    })
  })

  describe("Login", () => {
    it("should successfully login", async function() {
      this.timeout(5000);
      const userData = {
        username: "test",
        password: "test"
      };
      const result = await apiRequest.post("login", userData);
      console.log(result.status)
      console.log("result", result.data);
    })
  })
})


