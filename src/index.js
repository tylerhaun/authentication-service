const _ = require("lodash");
const bodyParser = require("body-parser");
const cuid = require('cuid');
const express = require("express");
const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize('sqlite::memory:');

class User extends Model {}
User.init({
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    defaultValue: function() {
      return cuid();
    },
  },
  username: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: "user",
  timestamps: true,
  paranoid: true,
});


class Password extends Model {}
Password.init({
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    defaultValue: function() {
      return cuid();
    },
  },
  password: {
    type: DataTypes.STRING,
  },
  active: {
    type: DataTypes.BOOLEAN,
  }
}, {
  sequelize,
  modelName: "password",
  timestamps: true,
  paranoid: true,
})
Password.beforeValidate(() => {
  async (user, options) => {
    const hashedPassword = await hashPassword(user.password);
    user.password = hashedPassword;

    return new Promise(function(resolve, reject) {
    
    })

  const bcrypt = require('bcrypt');               //Importing the NPM bcrypt package.
  const saltRounds = 10;                          //We are setting salt rounds, higher is safer.
  const myPlaintextPassword = 's0/\/\P4$$w0rD';   //Unprotected password


  /* Here we are getting the hashed password from the callback,
   * we can save that hash in the database */
  bcrypt.hash(myPlaintextPassword, saltRounds, (err, hash) => {
    //save the hash in the db
  });

  /* Here we can compare the hashed password after we get it from
      the database with the plaintext password */
  bcrypt.compare(myPlaintextPassword, hash, function(error, response) {
    // response == true if they match
    // response == false if password is wrong
  });


})


const app = express()


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use(bodyParser.json())

app.route("/users")

  .get(async function(request, response, next) {
    try {
      const users = await User.findAll({limit: 10})
      return response.json(users);
    }
    catch(error) {
      console.error(error);
      return next(error);
    }
  })

  .post(async function(request, response, next) {
    try {
      const userCreateArgs = _.pick(request.body, ["username", "password"]);
      console.log("userCreateArgs", userCreateArgs);
      const createdUser = await User.create(userCreateArgs);
      console.log("createdUser", createdUser);
      return response.json(createdUser);
    }
    catch(error) {
      console.error(error);
      return next(error);
    }
  })


app.route("/users/:id")
  .get(async function(request, response, next) {
    const id = request.params.id;
    const user = User.findOne({id})
    return response.json(user);
  })
  .post(async function(request, response, next) {
    return response.json();
  })
  .put(async function(request, response, next) {
    return response.json();
  })
  .delete(async function(request, response, next) {
    return response.json();
  })


app.use(function(error, request, response, next) {
  console.error(error);
  response.status(500)
  return response.send(error);
})


const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    if (process.send) {
      process.send("server.started");
    }
})








class Main {

  async main() {

    await sequelize.sync();
    const jane = await User.create({
          username: 'janedoe',
          birthday: new Date(1980, 6, 20)
        });
    console.log(jane.toJSON());
    console.log(await User.findAll())
  
  }

}


const main = new Main();
main.main()
  .catch(error => {
    console.error(error);
  })





