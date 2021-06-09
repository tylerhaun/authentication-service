const axios = require("axios");
const stream = require("stream");
const qs = require("qs");
const FormData = require('form-data');
const fs = require("fs");


const axiosConfig = {
  baseURL: `http://localhost:${process.env.PORT}/passwords`,
};
const apiRequest = axios.create(axiosConfig);


class UserApi {

  async create(data) {
    console.log("create()", data);

    const requestConfig = {
      headers: {
        "Content-Type": "application/json",
      }
    };
    const response = await apiRequest.post("", data, requestConfig)
      .catch(error => {
        console.error(error.data)
        throw error;
      });
    return response.data;

  }

  async get(query) {

    const queryParams = qs.stringify(query)
    const response = await apiRequest.get(`/${queryParams}`)
      .catch(error => {
        console.error(error.data);
        throw error;
      })
    return response.data;
    
  }

}


module.exports = UserApi;

