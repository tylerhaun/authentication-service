const axios = require("axios");
const childProcess = require("child_process");
const dotenv = require("dotenv");

dotenv.config();



var smsBuffer;

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

      server.on("message", (m) => {
        console.log("received message", m);
        try {
          var data = JSON.parse(m);
          console.log(data);
          if (data.event == "sms.sent") {
            smsBuffer = data.message;
            console.log("smsBuffer");
          }
        }
        catch(e) {}
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
    console.log("response.data", response.data);
  })
})


const username = "test";
const password = "password1";

var userId; // TODO hacky; fix
describe("API", () => {
  describe("User", () => {
    describe("Create", () => {
      it("should successfully create a new user", async function() {
        this.timeout(5000);
        const userData = {
          username,
          email: "test@test.com",
          phoneNumber: "716-555-5555",
          password,
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
        username,
        challenges: ["password", "sms"]
      };
      const response = await apiRequest.post("login", userData);
      console.log(response.status)
      console.log("response.data", response.data);
      const challenge = response.data.challenge;
      console.log("challenge", challenge);


      console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 1\n\n\n\n\n\n\n\n")
      const challengeData = {
        code: password,
      };
      const response2 = await apiRequest.post(`login-challenges/${challenge.id}/complete`, challengeData);
      console.log("response2.data", response2.data)
      const challenge2 = response2.data.challenge;
      console.log("challenge2", challenge2);

      console.log("\n\n\n\n\n\n\nCOMPLETING CHALLENGE 2\n\n\n\n\n\n\n\n")
      //console.log("sleeping for code...");
      //await new Promise(function(resolve, reject) {setTimeout(() => resolve(), 1000)})
      const code = smsBuffer.split(" ")[3];
      console.log("code", code);
      const challengeData2 = {
        code,
      };
      const response3 = await apiRequest.post(`login-challenges/${challenge2.id}/complete`, challengeData2);
      console.log("response3.data", response3.data)


    })
  })
})


