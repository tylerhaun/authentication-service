
const ip = "192.168.1.1"
const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.152 Safari/537.36";
const context = {
  username: "test",
  email: `test+${Math.round(Math.random() * 10000000)}@test.com`,
  password: "password1",
  ip,
  ua,
  token: "",
  userId: "",
}

module.exports = context;
