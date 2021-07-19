const context = require("../context");

describe('loading express', function() {
  it("should ping", async function() {
    this.timeout(5000);
    const response = await context.request.get("/ping")
      .expect(200)
    console.log("response.body", response.body);
  });
  it("should 404", async function() {
    const response = await context.request.get('/')
      .expect(404);
  });
});
